import { test, expect } from "@playwright/test";
import {
  inspectProse,
  useTheme,
  STYLEGUIDE_PATH,
  THEMES,
  type BorderTarget,
} from "./helpers/prose";

/**
 * Kontrast-Regression für `.prose-styles` in beiden Themes.
 *
 * Hintergrund: `.prose-styles` überschreibt im Dark Mode nur einzelne Farben.
 * Fehlt eine, bleibt die helle Standardfarbe von `@tailwindcss/typography`
 * stehen — z. B. hatte `thead th` `--tw-prose-headings` (#111827) auf dem
 * dunklen Body (#111827), also Kontrast 1.0. Für das Auge unsichtbar, im
 * Markup aber vorhanden: genau der Fall, den ein DOM-Test findet und ein
 * Snapshot-Diff nur als „irgendwas ist anders“ meldet.
 */

/** Alle Elemente, die `prose` einfärbt und die im Fixture vorkommen. */
const TEXT_SELECTORS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "em",
  "del",
  "a",
  "code",
  "pre code",
  "ul li",
  "ol li",
  "blockquote p",
  "blockquote cite",
  "table thead th",
  "table tbody td",
  "table tbody strong",
  "table tbody td code",
  "table tbody td a",
  "dt",
  "dd",
  "kbd",
  "figcaption",
  ".lead",
  "abbr",
  "sub",
  "sup",
];

const BORDER_TARGETS: BorderTarget[] = [
  { selector: "table thead", side: "bottom" },
  { selector: "table tbody tr", side: "bottom" },
  { selector: "hr", side: "top" },
  { selector: "blockquote", side: "left" },
];

/** WCAG 2.1 AA: 4.5:1 für normalen, 3:1 für großen Text. */
const AA_NORMAL = 4.5;
const AA_LARGE = 3;

/**
 * Bestandsfälle, die den AA-Schwellwert heute nicht erreichen. Sie sind hier
 * mit gemessenem Wert festgeschrieben, damit sie nicht stillschweigend
 * schlechter werden — und damit jedes *neue* Element ohne Ausnahme durchfällt.
 * Wer eine Farbe verbessert, senkt hier den Eintrag oder löscht ihn.
 */
const KNOWN_BELOW_AA: Record<string, { min: number; why: string }> = {
  // Markenfarbe blue-400 (#524FFD) auf gray-900. Vorbestehend, unabhängig vom
  // Dark-Mode-Fix der Prose-Farben.
  "dark::a": { min: 3, why: "Linkfarbe blue-400 auf dunklem Grund" },
  "dark::table tbody td a": { min: 3, why: "dieselbe Linkfarbe in Tabellenzellen" },
};

/** Eine Linie muss nicht lesbar sein, aber vom Untergrund unterscheidbar. */
const MIN_BORDER_CONTRAST = 1.15;

for (const theme of THEMES) {
  test.describe(`prose – ${theme}`, () => {
    test.use({ colorScheme: theme });

    test(`jedes Prose-Element ist im ${theme} Mode lesbar`, async ({ page, context, baseURL }) => {
      await useTheme(context, theme, baseURL!);
      await page.goto(STYLEGUIDE_PATH);
      await expect(page.getByTestId("prose")).toBeVisible();
      await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /^(?!.*dark).*$/);

      const { text } = await inspectProse(page, TEXT_SELECTORS);

      const missing = text.filter((sample) => sample.count === 0).map((s) => s.selector);
      expect(
        missing,
        "Die Testdaten decken diese Selektoren nicht mehr ab — src/fixtures/prose-kitchen-sink.md ergänzen",
      ).toEqual([]);

      const failures = text.filter((sample) => {
        const known = KNOWN_BELOW_AA[`${theme}::${sample.selector}`];
        const threshold = known?.min ?? (sample.isLargeText ? AA_LARGE : AA_NORMAL);
        return sample.ratio < threshold;
      });

      expect(
        failures.map((f) => `${f.selector}: ${f.ratio}:1 (${f.color} auf ${f.background}) — „${f.text}“`),
        `Zu geringer Kontrast im ${theme} Mode`,
      ).toEqual([]);
    });

    test(`Tabellen- und Zitatlinien sind im ${theme} Mode sichtbar`, async ({ page, context, baseURL }) => {
      await useTheme(context, theme, baseURL!);
      await page.goto(STYLEGUIDE_PATH);
      await expect(page.getByTestId("prose")).toBeVisible();

      const { borders } = await inspectProse(page, [], BORDER_TARGETS);

      expect(
        borders.filter((b) => b.count === 0).map((b) => b.selector),
        "Fixture deckt diese Rahmen nicht mehr ab",
      ).toEqual([]);

      expect(
        borders
          .filter((b) => b.widthPx > 0 && b.ratio < MIN_BORDER_CONTRAST)
          .map((b) => `${b.selector}: ${b.ratio}:1 (${b.color})`),
        `Unsichtbare Linien im ${theme} Mode`,
      ).toEqual([]);
    });
  });
}

test("Tabellenkopf ist im Dark Mode nicht die Body-Hintergrundfarbe", async ({
  page,
  context,
  baseURL,
}) => {
  // Der ursprüngliche Bug, so eng wie möglich formuliert: `thead th` erbte die
  // Headings-Farbe für den Light Mode und war damit exakt so dunkel wie der
  // Hintergrund.
  await useTheme(context, "dark", baseURL!);
  await page.goto(STYLEGUIDE_PATH);

  const { text } = await inspectProse(page, ["table thead th"]);
  const th = text[0];

  expect(th.count).toBeGreaterThan(0);
  expect(th.color).not.toBe(th.background);
  expect(th.ratio).toBeGreaterThanOrEqual(AA_NORMAL);
});
