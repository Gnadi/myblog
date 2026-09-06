import type { BrowserContext, Page } from "@playwright/test";
import { THEME_COOKIE_KEY } from "../../src/lib/theme";

export type Theme = "light" | "dark";
export const THEMES: Theme[] = ["light", "dark"];

/** Die Styleguide-Seite mit allen Prose-Elementen (src/pages/dev/styleguide.astro). */
export const STYLEGUIDE_PATH = "/dev/styleguide";

/**
 * Setzt das Theme so, wie es der Init-Skript aus `src/lib/theme.ts` liest:
 * über das geteilte Cookie. Damit steht die Wahl schon vor dem ersten Paint
 * fest — kein Klick auf den Toggle, kein Flackern, keine Race-Condition.
 */
export async function useTheme(context: BrowserContext, theme: Theme, baseURL: string) {
  await context.addCookies([{ name: THEME_COOKIE_KEY, value: theme, url: baseURL }]);
}

export type TextSample = {
  selector: string;
  /** Treffer im Fixture. 0 heißt: die Testdaten decken das Element nicht ab. */
  count: number;
  text: string;
  color: string;
  background: string;
  /** WCAG-Kontrastverhältnis, 1 (unsichtbar) bis 21 (Schwarz auf Weiß). */
  ratio: number;
  fontSizePx: number;
  fontWeight: number;
  /** WCAG: ab 24px — oder ab 18.66px bei fett — gilt Text als „groß“. */
  isLargeText: boolean;
};

export type BorderSample = {
  selector: string;
  side: string;
  count: number;
  color: string;
  widthPx: number;
  ratio: number;
};

export type BorderTarget = { selector: string; side: "top" | "bottom" | "left" };

type CollectArgs = { textSelectors: string[]; borderSelectors: BorderTarget[] };

/**
 * Läuft im Browser und misst innerhalb von `[data-testid="prose"]`.
 *
 * Der Bug, gegen den das absichert: Elemente wie `thead th` behielten im Dark
 * Mode die helle Standardfarbe von `@tailwindcss/typography` und standen damit
 * fast unsichtbar auf dunklem Grund — Kontrast ≈ 1.0 statt ≥ 4.5.
 */
const collect = ({ textSelectors, borderSelectors }: CollectArgs) => {
  type Rgba = [number, number, number, number];

  const parse = (value: string): Rgba => {
    const parts = value.match(/[\d.]+/g)?.map(Number) ?? [];
    const [r = 0, g = 0, b = 0, a = 1] = parts;
    return [r, g, b, a];
  };

  /** Alpha-Blending: Vordergrund über Hintergrund. */
  const over = (fg: Rgba, bg: Rgba): Rgba => [
    fg[0] * fg[3] + bg[0] * (1 - fg[3]),
    fg[1] * fg[3] + bg[1] * (1 - fg[3]),
    fg[2] * fg[3] + bg[2] * (1 - fg[3]),
    1,
  ];

  const luminance = ([r, g, b]: Rgba) => {
    const channel = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };

  const contrast = (a: Rgba, b: Rgba) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  };

  const rgb = ([r, g, b]: Rgba) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

  /** Legt alle halbtransparenten Hintergründe bis zur ersten deckenden Fläche übereinander. */
  const effectiveBackground = (el: Element): Rgba => {
    const layers: Rgba[] = [];
    let node: Element | null = el;
    let base: Rgba = [255, 255, 255, 1];
    while (node) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg[3] >= 1) {
        base = bg;
        break;
      }
      if (bg[3] > 0) layers.push(bg);
      node = node.parentElement;
    }
    return layers.reduceRight((acc, layer) => over(layer, acc), base);
  };

  const root = document.querySelector('[data-testid="prose"]');
  if (!root) throw new Error('Kein [data-testid="prose"] auf der Seite gefunden.');

  const text = textSelectors.map((selector) => {
    const found = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => el.getClientRects().length > 0,
    );
    const el = found[0];
    if (!el) {
      return {
        selector, count: 0, text: "", color: "", background: "",
        ratio: 0, fontSizePx: 0, fontWeight: 0, isLargeText: false,
      };
    }
    const style = getComputedStyle(el);
    const background = effectiveBackground(el);
    const color = over(parse(style.color), background);
    const fontSizePx = parseFloat(style.fontSize);
    const fontWeight = Number(style.fontWeight) || 400;
    return {
      selector,
      count: found.length,
      text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60),
      color: rgb(color),
      background: rgb(background),
      ratio: contrast(color, background),
      fontSizePx,
      fontWeight,
      isLargeText: fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700),
    };
  });

  const borders = borderSelectors.map(({ selector, side }) => {
    const el = root.querySelector<HTMLElement>(selector);
    if (!el) return { selector, side, count: 0, color: "", widthPx: 0, ratio: 0 };
    const style = getComputedStyle(el);
    const color = parse(style.getPropertyValue(`border-${side}-color`));
    const widthPx = parseFloat(style.getPropertyValue(`border-${side}-width`));
    const background = effectiveBackground(el);
    return {
      selector: `${selector} (border-${side})`,
      side,
      count: 1,
      color: rgb(color),
      widthPx,
      ratio: contrast(over(color, background), background),
    };
  });

  return { text, borders };
};

export async function inspectProse(
  page: Page,
  textSelectors: string[],
  borderSelectors: BorderTarget[] = [],
): Promise<{ text: TextSample[]; borders: BorderSample[] }> {
  return page.evaluate(collect, { textSelectors, borderSelectors });
}
