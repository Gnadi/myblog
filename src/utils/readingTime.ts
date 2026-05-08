function extractTextFromNode(node: any): string {
  if (!node) return '';
  if (node.text) return node.text;
  if (Array.isArray(node.content)) return node.content.map(extractTextFromNode).join(' ');
  return '';
}

export function getReadingTime(content: string | object): number {
  let text: string;
  if (typeof content === 'object' && content !== null) {
    text = extractTextFromNode(content);
  } else if (typeof content === 'string' && content.includes('<')) {
    text = content.replace(/<[^>]*>/g, ' ');
  } else {
    text = content as string;
  }
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(words / 200));
}
