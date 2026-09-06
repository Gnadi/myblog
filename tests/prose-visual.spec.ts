import { test, expect } from "@playwright/test";
import { useTheme, STYLEGUIDE_PATH, THEMES } from "./helpers/prose";

/**
 * Kein Snapshot-Vergleich, sondern ein Beleg zum Anschauen: hängt den
 * Styleguide in beiden Themes als Vollbild an den HTML-Report.
 *
 * Warum kein `toHaveScreenshot()`: Referenzbilder sind an Betriebssystem und
 * Font-Rendering gebunden. Ein Baseline-Satz aus dem CI-Container passt nicht
 * zum Mac des Entwicklers und umgekehrt — das kostet mehr Zeit in falsch-roten
 * Tests, als es an echten Regressionen findet. Die harten Zusicherungen macht
 * `prose-contrast.spec.ts`; hier geht es um „einmal draufschauen“:
 *
 *   npm run test && npm run test:report
 */
for (const theme of THEMES) {
  test(`Styleguide-Screenshot (${theme})`, async ({ page, context, baseURL }, testInfo) => {
    await useTheme(context, theme, baseURL!);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(STYLEGUIDE_PATH);
    await expect(page.getByTestId("prose")).toBeVisible();
    // highlight.js färbt die Codeblöcke erst nach DOMContentLoaded ein.
    await expect(page.locator("pre code.hljs").first()).toBeVisible();
    // Die Dev-Toolbar schwebt über dem Inhalt und hat im Screenshot nichts
    // verloren.
    await page.addStyleTag({ content: "astro-dev-toolbar { display: none !important }" });

    await testInfo.attach(`styleguide-${theme}.png`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });
}

test("Styleguide bleibt aus dem Suchindex", async ({ page }) => {
  await page.goto(STYLEGUIDE_PATH);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
