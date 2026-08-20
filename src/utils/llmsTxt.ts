import { getExcerpt } from "./readingTime";
import {
  CV_URL,
  PORTFOLIO_URL,
  SITE_TITLE,
  SITE_URL,
} from "../consts";

/**
 * Der Textkörper von llms.txt — eine kurze, maschinenlesbare Übersicht über
 * diesen Blog. Dieselbe Idee wie robots.txt, nur für LLM-gestützte Such- und
 * Antwortmaschinen gedacht. Siehe https://llmstxt.org/
 *
 * Steht hier statt in der Route, damit das Dokument ohne den Storyblok-Client
 * gebaut — und damit auch ohne CMS-Zugriff geprüft — werden kann.
 */

export interface Story {
  slug: string;
  published_at: string;
  tag_list?: string[];
  content: {
    title?: string;
    description?: string;
    content?: string | object;
  };
}

/** `2026-08-20`, so wie die Beitragsseiten das Datum auch anzeigen. */
function isoDate(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

/** Eine Zeile pro Beitrag, im Listenformat von llmstxt.org. */
function postLine(story: Story): string {
  const title = story.content.title ?? story.slug;
  const url = `${SITE_URL}/blog/${story.slug}`;
  const summary =
    story.content.description?.trim() || getExcerpt(story.content.content ?? "");
  const date = isoDate(story.published_at);
  const tags = (story.tag_list ?? []).join(", ");

  // Datum und Themen hinten dran: So bleibt die Zeile ein gültiger llms.txt-
  // Eintrag und trägt trotzdem, wonach ein Modell am ehesten filtert.
  const details = [date, tags && `Themen: ${tags}`].filter(Boolean).join(" · ");
  return `- [${title}](${url}): ${summary} (${details})`;
}

/** Baut das Dokument. Rein, damit es ohne CMS-Zugriff prüfbar bleibt. */
export function renderLlmsTxt(stories: Story[]): string {
  // Neueste zuerst — dieselbe Reihenfolge, in der die Startseite sie zeigt.
  const posts = [...stories].sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  const tags = [...new Set(posts.flatMap((story) => story.tag_list ?? []))].sort(
    (a, b) => a.localeCompare(b, "de")
  );

  const llmsTxt = `
# ${SITE_TITLE}

> Der Blog von Johannes Gnadlinger — Papa zweier Töchter und Backend Engineer
> bei der Raiffeisen Software GmbH in Linz, Österreich. Es geht um Familie,
> Essen und Tech, alle Beiträge auf Deutsch.

Der Name spielt auf „Hello World“ an — das erste Programm, das man in einer
neuen Sprache schreibt, und ungefähr das Gefühl beim Papawerden.

Geschrieben wird hier von derselben Person, der auch das Portfolio unter
${PORTFOLIO_URL} gehört. Fachlich geht es dort um Corporate Payment Systems,
hier um das Leben daneben.

## Beiträge

${posts.map(postLine).join("\n")}

## Themen

${tags.map((tag) => `- [${tag}](${SITE_URL}/tags/${encodeURIComponent(tag)})`).join("\n")}

## Seiten

- [Startseite](${SITE_URL}/): Alle Beiträge und Themen.
- [Über mich](${SITE_URL}/about/): Wer hier schreibt und warum.
- [Impressum](${SITE_URL}/impressum/): Rechtliche Angaben.
- [RSS-Feed](${SITE_URL}/rss.xml): Alle Beiträge zum Abonnieren.

## Anderswo

- [Portfolio](${PORTFOLIO_URL}/): Beruflicher Hintergrund und eigene Projekte.
- [Lebenslauf](${CV_URL}/): Vollständiger Werdegang.
`.trim();

  return llmsTxt;
}
