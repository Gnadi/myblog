// In dev draft content, in production only published stories.
export const contentVersion: 'draft' | 'published' = import.meta.env.DEV
  ? 'draft'
  : 'published';

interface StoryblokClient {
  get: (path: string, params?: Record<string, unknown>) => Promise<{ data: any }>;
}

/**
 * Fetches ALL stories matching the given params. The Storyblok CDN API
 * paginates with a default per_page of 25, so a single `cdn/stories` call
 * silently caps the result — this helper pages through until done.
 */
export async function getAllStories(
  sbApi: StoryblokClient,
  params: Record<string, unknown> = {}
): Promise<any[]> {
  const perPage = 100;
  const stories: any[] = [];
  let page = 1;
  while (true) {
    const { data } = await sbApi.get('cdn/stories', {
      ...params,
      per_page: perPage,
      page,
    });
    stories.push(...data.stories);
    if (data.stories.length < perPage) break;
    page++;
  }
  return stories;
}
