# MyBlog

Welcome to **MyBlog**! This is a personal blog built using [Astro](https://astro.build) and [Tailwind](https://tailwindcss.com/),a simple, blog-aware static site generator.\
It's designed to showcase my thoughts, projects, and ideas in a clean and minimalist design. You can view the blog at [blog.gnadlinger.me](https://blog.gnadlinger.me).
For writing my blog posts I use the Headless CMS [Storyblok](https://storyblok.com/)

## Features

- **Clean and Minimalist Design**: A simple design focused on readability and content.
- **Storyblok Support**: Write your posts in Markdown for easy formatting and styling.
- **Customizable**: You can customize the layout, colors, and design to fit your personal style.
- **Responsive**: The site works well on both mobile and desktop devices.
- **Light and Dark Theme**: Perfect vision on every system

## Development

```bash
npm ci
npm run dev          # dev server on http://localhost:4321
npm run check        # astro check (types + templates)
```

### Typography styleguide

`/dev/styleguide` renders [`src/fixtures/prose-kitchen-sink.md`](src/fixtures/prose-kitchen-sink.md)
through the same pipeline as a real blog post — marked → `.prose-styles` →
highlight.js — but without Storyblok. It contains every element that
`@tailwindcss/typography` colours, so a change to `src/styles/global.css` can be
reviewed in both themes on one page:

```bash
npm run styleguide   # opens the page directly
```

The page is `noindex` and excluded from the sitemap.

### Tests

```bash
npx playwright install chromium   # once
npm test                          # run the suite
npm run test:report               # open the HTML report
npm run test:ui                   # interactive runner
```

- `tests/prose-contrast.spec.ts` measures the computed text, background and
  border colours of every prose element in both themes and asserts WCAG AA
  contrast. This is the regression guard for dark-mode colour bugs: an element
  that keeps a light-mode colour on the dark background scores 1:1 and fails
  with the exact selector and measured ratio.
- `tests/prose-visual.spec.ts` attaches full-page screenshots of both themes to
  the HTML report — for looking at, not for pixel comparison. Reference images
  are tied to OS and font rendering, so a baseline from CI would not match a
  developer machine; the hard assertions live in the contrast spec instead.

Known contrast exceptions are listed in `KNOWN_BELOW_AA` in the contrast spec,
with the measured value, so they cannot silently get worse.

If Chromium is already present in the environment, point
`PLAYWRIGHT_CHROMIUM_PATH` at it to skip the download.

