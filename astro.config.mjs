import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import { loadEnv } from 'vite';
import storyblok from '@storyblok/astro';
import icon from "astro-icon";
import db from "@astrojs/db";
import vercel from "@astrojs/vercel/serverless";
const env = loadEnv("", process.cwd(), 'STORYBLOK');


// https://astro.build/config
export default defineConfig({
  markdown: {
    drafts: true,
    shikiConfig: {
      theme: "css-variables"
    }
  },
  shikiConfig: {
    wrap: true,
    skipInline: false,
    drafts: true
  },
  site: 'https://lexingtonthemes.com',
  integrations: [tailwind(), sitemap(), mdx(), icon(), storyblok({
    accessToken: env.STORYBLOK_TOKEN,
    components: {
      blogPost: 'storyblok/BlogPost',
      blogPostList: 'storyblok/BlogPostList',
      page: 'storyblok/Page'
    },
    apiOptions: {
      region: 'eu'
    }
  }), db()],
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    }
  })
});