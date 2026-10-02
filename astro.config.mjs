import { defineConfig } from 'astro/config';
import sitemap from "@astrojs/sitemap";
import { loadEnv } from 'vite';
import {storyblok} from '@storyblok/astro';
import icon from "astro-icon";

const env = loadEnv("", process.cwd(), 'STORYBLOK');

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: "css-variables",
      wrap: true,
    }
  },
  site: 'https://blog.gnadlinger.me',
  // Ein Beitrag hat genau eine URL: /blog/slug/. Vercel leitet die Variante
  // ohne Slash per 308 dorthin um (vercel.json), damit Google nicht zwei
  // Adressen mit demselben Inhalt crawlt und eine davon als "Alternative page
  // with proper canonical tag" aussortiert.
  trailingSlash: 'always',
  integrations: [sitemap(), icon(), storyblok({
    accessToken: env.STORYBLOK_TOKEN,
    components: {
      blogPost: 'storyblok/BlogPost',
      blogPostMarkdown: 'storyblok/BlogPostMarkdown',
      blogPostList: 'storyblok/BlogPostList',
      page: 'storyblok/Page',
    },
    apiOptions: {
      region: 'eu',
    },
  })]
});
