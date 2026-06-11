import rss from '@astrojs/rss';
import { useStoryblokApi } from '@storyblok/astro';
import { getAllStories } from '../utils/storyblok';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context: any) {
  const sbApi = useStoryblokApi();
  const stories = await getAllStories(sbApi, {
    version: 'published',
    starts_with: 'blog/',
  });

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    customData: '<language>de</language>',
    items: stories.map((story: any) => ({
      title: story.content.title,
      pubDate: new Date(story.published_at),
      description: story.content.description ?? '',
      link: `/blog/${story.slug}`,
    })),
  });
}
