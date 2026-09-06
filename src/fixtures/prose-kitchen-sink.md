# Typografie-Testseite (h1)

Dieser Text ist die Testdatenbasis für `.prose-styles`. Er enthält bewusst
**jedes** Element, das `@tailwindcss/typography` einfärbt — damit ein
Farbproblem im Light- **oder** Dark-Mode hier sofort auffällt und nicht erst
in einem echten Blogpost.

## Fließtext und Auszeichnungen (h2)

Ein normaler Absatz mit **fett**, *kursiv*, ***fett-kursiv***, ~~durchgestrichen~~,
einem [Link auf die Startseite](/) und `inline code` mittendrin. Danach ein
zweiter Absatz, damit die Abstände zwischen Absätzen sichtbar werden.

### Überschrift dritter Ebene (h3)

#### Überschrift vierter Ebene (h4)

##### Überschrift fünfter Ebene (h5)

###### Überschrift sechster Ebene (h6)

## Tabellen

Der Fall aus dem Bug-Report: eine Tabelle mit Kopfzeile. Der Kopf nutzt
`--tw-prose-headings`, der Rumpf `--tw-prose-body`.

| Parameter                  | Wert                    |
|----------------------------|-------------------------|
| Beetfläche (Sommerblumen)  | ~2.000 m²               |
| Wasserbedarf Blumenbeet    | ~20 l / m² / Woche      |
| Bewässerungssaison         | ~20 Wochen (Mai–Sept.)  |
| **Gesamtwasserbedarf**     | **~800 m³ / Jahr**      |

Und eine mit Spaltenausrichtung und einem Link plus Code in einer Zelle:

| Links       |    Zentriert     |        Rechts |
|:------------|:----------------:|--------------:|
| `npm ci`    | [Doku](/)        |         12,50 |
| `npm test`  | **hervorgehoben**|        340,00 |

## Listen

- Erster Punkt
- Zweiter Punkt mit `Code`
  - Verschachtelt
  - Noch einer
- Dritter Punkt

1. Erster Schritt
2. Zweiter Schritt
   1. Unterschritt
   2. Noch ein Unterschritt
3. Dritter Schritt

- [ ] Offene Aufgabe
- [x] Erledigte Aufgabe

## Zitat

> Wer im Dark Mode nichts sieht, hat kein Design-Problem, sondern ein
> Kontrast-Problem.
>
> — <cite>Niemand, aber es stimmt trotzdem</cite>

## Code

Ein Codeblock mit Highlighting (highlight.js läuft client-seitig, siehe
`src/pages/blog/[...slug].astro`):

```ts
// Kommentar zum Testen der hljs-Farben
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const OK = contrast("#111827", "#ffffff") >= 4.5; // true
```

```bash
npm run dev
npm run test
```

Und ein Block ganz ohne Sprache:

```
Nur Text, kein Highlighting.
```

## Trennlinie

---

## Rohes HTML

Elemente, die Markdown nicht kennt, die `prose` aber einfärbt:

<dl>
  <dt>Definitionsterm</dt>
  <dd>Die zugehörige Beschreibung. Nutzt ebenfalls die Headings-Farbe.</dd>
  <dt>Zweiter Term</dt>
  <dd>Noch eine Beschreibung.</dd>
</dl>

<p>Tastenkürzel: <kbd>Strg</kbd> + <kbd>C</kbd> zum Kopieren.</p>

<figure>
  <!-- Inline-SVG statt einer echten Datei: hält das Fixture unabhängig von
       Assets im public-Ordner und in beiden Themes gleich lesbar. -->
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%239ca3af'/%3E%3Ctext x='320' y='192' font-family='sans-serif' font-size='30' fill='%23111827' text-anchor='middle'%3EPlatzhalterbild 640 %C3%97 360%3C/text%3E%3C/svg%3E" alt="Grauer Platzhalter mit Größenangabe" width="640" height="360" />
  <figcaption>Eine Bildunterschrift — nutzt <code>--tw-prose-captions</code>.</figcaption>
</figure>

<p class="lead">Ein Lead-Absatz mit eigener Farbvariable.</p>

<p>Abkürzungen wie <abbr title="Cascading Style Sheets">CSS</abbr> und
tiefgestellter <sub>Index</sub> sowie hochgestellte <sup>Potenz</sup>.</p>
