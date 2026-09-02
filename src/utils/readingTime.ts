function extractTextFromNode(node: any): string {
  if (!node) return '';
  if (node.text) return node.text;
  if (Array.isArray(node.content)) return node.content.map(extractTextFromNode).join(' ');
  return '';
}

function toPlainText(content: string | object): string {
  if (typeof content === 'object' && content !== null) {
    return extractTextFromNode(content);
  }
  if (typeof content === 'string' && content.includes('<')) {
    return content.replace(/<[^>]*>/g, ' ');
  }
  return (content as string) ?? '';
}

export function getReadingTime(content: string | object): number {
  const text = toPlainText(content);
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Derives a unique meta-description excerpt from a post's actual body
 * content, used as a fallback when the CMS `description` field is empty.
 */
export function getExcerpt(content: string | object, maxLength = 160): string {
  const text = toPlainText(content).trim().replace(/\s+/g, ' ');
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

/** Wörter im Beitrag — speist `wordCount` in der BlogPosting-Auszeichnung. */
export function getWordCount(content: string | object): number {
  return toPlainText(content)
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}
