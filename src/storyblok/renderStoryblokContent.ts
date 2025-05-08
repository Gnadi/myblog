import { marked } from 'marked';
// Korrekter Import für Astro:
import { renderRichText as astroRenderRichText } from '@storyblok/astro';
import sanitizeHtml from 'sanitize-html';

export function renderStoryblokContent(input: any): string {
    let html = '';

    // Prüfen, ob es sich um ein Storyblok RichText-Objekt handelt
    if (input && typeof input === 'object' && input.type === 'doc' && input.content) {
        html = astroRenderRichText(input); // Die Funktion von @storyblok/astro verwenden
    } else if (typeof input === 'string') {
        // Annahme: Es ist Markdown, wenn es ein String ist
        // marked() kann ein Promise zurückgeben, wenn async-Optionen verwendet werden.
        // Für den Standardfall ist es synchron.
        try {
            const parsedMarkdown = marked(input);
            if (typeof parsedMarkdown === 'string') {
                html = parsedMarkdown;
            } else {
                // Falls marked doch ein Promise zurückgibt (unwahrscheinlich ohne async config),
                // müsstest du diese Funktion asynchron machen und await verwenden.
                // Fürs Erste gehen wir von einem String aus oder loggen einen Fehler.
                console.error("marked() returned a Promise. Adjust renderStoryblokContent to be async.");
                html = ''; // Fallback
            }
        } catch (e) {
            console.error("Error parsing markdown:", e);
            html = ''; // Fallback bei Fehler
        }
    } else if (input) {
        // Fallback für unerwartete Typen
        console.warn('renderStoryblokContent received unexpected input type:', typeof input, input);
    }

    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'pre', 'code', 'iframe']), // pre, code für Syntax-Highlighting, iframe für z.B. Videos
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
            a: ['href', 'name', 'target', 'rel'],
            pre: ['class'], // Erlaube 'class' für <pre> (wichtig für highlight.js)
            code: ['class'], // Erlaube 'class' für <code> (wichtig für highlight.js)
            iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title'], // Für eingebettete Inhalte
        },
        allowedSchemes: ['http', 'https', 'mailto', 'tel'],
        // Erlaube Klassen, die von highlight.js oder Tailwind Typography (prose) hinzugefügt werden könnten
        allowedClasses: {
            '*': [ 'language-*', 'hljs-*', 'hljs', /* weitere Tailwind prose Klassen bei Bedarf */ ]
        }
    });
}