export interface PostSummary {
  slug: string;
  tags: string[];
  title: string;
  description: string;
  image: string;
  date: string;
}

export function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  allPosts: PostSummary[],
  limit = 3
): PostSummary[] {
  return allPosts
    .filter(p => p.slug !== currentSlug && p.tags.some(t => currentTags.includes(t)))
    .sort((a, b) => {
      const aShared = a.tags.filter(t => currentTags.includes(t)).length;
      const bShared = b.tags.filter(t => currentTags.includes(t)).length;
      return bShared - aShared;
    })
    .slice(0, limit);
}
