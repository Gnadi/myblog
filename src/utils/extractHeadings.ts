export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function extractHeadingsFromRichText(content: any): Heading[] {
  const headings: Heading[] = [];
  if (!content?.content) return headings;
  for (const node of content.content) {
    const level = node.attrs?.level;
    if (node.type === 'heading' && (level === 2 || level === 3)) {
      const text = (node.content ?? []).map((c: any) => c.text ?? '').join('');
      if (text) headings.push({ id: slugify(text), text, level });
    }
  }
  return headings;
}

export function extractHeadingsFromMarkdown(markdown: string): Heading[] {
  const headings: Heading[] = [];
  for (const line of markdown.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length as 2 | 3;
      const text = match[2].trim();
      headings.push({ id: slugify(text), text, level });
    }
  }
  return headings;
}

export function addHeadingIds(html: string): string {
  return html.replace(/<(h[23])>(.*?)<\/\1>/gs, (_match, tag, inner) => {
    const text = inner.replace(/<[^>]*>/g, '');
    const id = slugify(text);
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });
}
