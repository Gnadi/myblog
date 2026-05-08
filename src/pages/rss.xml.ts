import rss from '@astrojs/rss';
import { useStoryblokApi } from '@storyblok/astro';

export async function GET(context: any) {
  const sbApi = useStoryblokApi();
  const { data } = await sbApi.get('cdn/stories', {
    version: 'published',
    starts_with: 'blog/',
  });

  return rss({
    title: 'HelloDad',
    description: 'Blog von Johannes Gnadlinger',
    site: context.site,
    items: data.stories.map((story: any) => ({
      title: story.content.title,
      pubDate: new Date(story.published_at),
      description: story.content.description ?? '',
      link: `/blog/${story.slug}`,
    })),
  });
}
