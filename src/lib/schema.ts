/**
 * schema.org JSON-LD für den Blog.
 *
 * Wichtigster Punkt sind die `@id`-Anker. Portfolio, CV und Blog sind drei
 * Deployments auf drei Hosts; dass sie dieselbe Person beschreiben, erfährt
 * eine Suchmaschine nur, wenn sie Knoten unter demselben `@id` veröffentlichen.
 * Deshalb zeigen die Werte auf www.gnadlinger.me, obwohl von dort nichts
 * ausgeliefert wird: Ein `@id` ist ein Name für die Entität, keine Adresse zum
 * Abrufen.
 *
 * Das Portfolio verweist per `subjectOf` seinerseits auf `BLOG_WEBSITE_ID` —
 * ein Knoten, den bis hierher niemand veröffentlicht hat. Diese Datei ist die
 * Gegenseite dieser Referenz.
 *
 * Gegenstück: `src/lib/schema.ts` im Portfolio, `src/lib/entity.ts` im CV.
 */

import { CV_URL, PORTFOLIO_URL, SITE_NAME, SITE_URL } from "../consts";

/** Der Origin, dem die Entitätsnamen unten gehören. */
export const ENTITY_ORIGIN = PORTFOLIO_URL;

export const PERSON_ID = `${ENTITY_ORIGIN}/#person`;
export const EMPLOYER_ID = `${ENTITY_ORIGIN}/#raiffeisen-software`;

/** Der Knoten, auf den das Portfolio per `subjectOf` zeigt. */
export const BLOG_WEBSITE_ID = `${SITE_URL}/#website`;

/** Das Zuhause der Person im Web — das Portfolio, nicht dieser Blog. */
export const PERSON_URL = `${ENTITY_ORIGIN}/`;

export const FULL_NAME = "Johannes Gnadlinger";

/**
 * Die Profile, die dieselbe Person beschreiben. Zeichengenau identisch mit der
 * Liste im Portfolio und im CV — weicht auch nur ein Slash ab, sind es für
 * eine Suchmaschine zwei Belege statt eines starken.
 */
export const SAME_AS = [
  "https://github.com/Gnadi",
  "https://www.linkedin.com/in/johannes-gnadlinger-842293271",
  "https://stackoverflow.com/users/6504152/johannes-gnadlinger",
  `${PORTFOLIO_URL}/`,
  `${CV_URL}/`,
];

export type JsonLdNode = Record<string, unknown>;

/**
 * Der Person-Knoten. Bewusst schlank: Die ausführliche Beschreibung steht im
 * Portfolio und im CV, hier geht es nur darum, denselben Anker zu bestätigen
 * und den Blog als Werk dieser Person auszuweisen.
 */
export function personNode(): JsonLdNode {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: FULL_NAME,
    givenName: "Johannes",
    familyName: "Gnadlinger",
    url: PERSON_URL,
    worksFor: { "@id": EMPLOYER_ID },
    sameAs: SAME_AS,
  };
}

/** Der Blog selbst — der Knoten, den das Portfolio referenziert. */
export function websiteNode(description: string): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": BLOG_WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description,
    inLanguage: "de-AT",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    copyrightHolder: { "@id": PERSON_ID },
  };
}

export interface Crumb {
  name: string;
  /** Absolute URL. Entfällt beim letzten Element, der aktuellen Seite. */
  item?: string;
}

export function breadcrumbNode(canonical: string, crumbs: Crumb[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.item ? { item: crumb.item } : {}),
    })),
  };
}

export interface BlogPostingInput {
  canonical: string;
  headline: string;
  description: string;
  /** ISO-Datum der Veröffentlichung. */
  datePublished?: string | undefined;
  /** ISO-Datum der letzten Änderung, falls Storyblok eines liefert. */
  dateModified?: string | undefined;
  /** Absolute Bild-URL. */
  image?: string | undefined;
  keywords?: readonly string[] | undefined;
  /** Wörter im Beitrag — speist `wordCount`. */
  wordCount?: number | undefined;
}

/**
 * Ein Beitrag. `author` und `publisher` zeigen auf den geteilten Person-Anker;
 * genau diese Verknüpfung hat bisher gefehlt, weshalb die Beiträge dem
 * Portfolio-Profil nicht zugeordnet werden konnten.
 */
export function blogPostingNode(input: BlogPostingInput): JsonLdNode {
  return {
    "@type": "BlogPosting",
    "@id": `${input.canonical}#post`,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.canonical },
    url: input.canonical,
    headline: input.headline,
    description: input.description,
    inLanguage: "de-AT",
    isPartOf: { "@id": BLOG_WEBSITE_ID },
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    // Ohne eigenes Änderungsdatum ist das Veröffentlichungsdatum die ehrlichste
    // Angabe — ein erfundenes dateModified wäre schlechter als keines.
    ...((input.dateModified ?? input.datePublished)
      ? { dateModified: input.dateModified ?? input.datePublished }
      : {}),
    ...(input.image ? { image: input.image } : {}),
    ...(input.keywords?.length ? { keywords: [...input.keywords] } : {}),
    ...(input.wordCount ? { wordCount: input.wordCount } : {}),
  };
}

/** Eine Übersichtsseite — Startseite, Tag-Liste, einzelne Tag-Seite. */
export function collectionPageNode(
  canonical: string,
  name: string,
  description: string,
): JsonLdNode {
  return {
    "@type": "CollectionPage",
    "@id": `${canonical}#collectionpage`,
    url: canonical,
    name,
    description,
    inLanguage: "de-AT",
    isPartOf: { "@id": BLOG_WEBSITE_ID },
    about: { "@id": PERSON_ID },
  };
}

/** Baut den Graphen und serialisiert ihn für `set:html`. */
export function buildGraph(nodes: JsonLdNode[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  });
}
