import { marked } from 'marked';
import { renderRichText } from '@storyblok/react';
import sanitizeHtml from 'sanitize-html';

export function renderStoryblokContent(input: any): string {
    let html = '';

    if (typeof input === 'object' && input?.type === 'doc') {
        html = renderRichText(input);
    } else if (typeof input === 'string') {
        html = marked(input);
    }

    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
            a: ['href', 'name', 'target', 'rel'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
    });
}
