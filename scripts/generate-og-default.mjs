/**
 * Generates public/og-default.jpg — the 1200×630 card used for every page that
 * has no image of its own: the home page, the tag pages, about and impressum.
 *
 * consts.ts has pointed DEFAULT_OG_IMAGE at this path all along, but the file
 * was never created, so those pages were shared with no preview at all.
 *
 * Run with `node scripts/generate-og-default.mjs` after changing the copy.
 * The output is committed, so this is not part of the build — same arrangement
 * as scripts/generate-og-assets.mjs in the portfolio repository.
 */
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "og-default.jpg");

const WIDTH = 1200;
const HEIGHT = 630;

/** Escapes text for safe inclusion in the SVG source. */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The wordmark is the site's own h1, set the way the site sets it. The blog
// uses the system sans stack for display text and JetBrains Mono for code, so
// the card follows suit rather than inventing a third voice.
const card = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff"/>

  <!-- A thin rule at the top, echoing the border under the site header. -->
  <rect x="0" y="0" width="${WIDTH}" height="10" fill="#111827"/>

  <text x="90" y="290"
        font-family="DejaVu Sans, Helvetica, Arial, sans-serif"
        font-size="128" font-weight="600" fill="#111827"
        letter-spacing="-2">${esc("Hello.._ DAD")}</text>

  <text x="94" y="400"
        font-family="DejaVu Sans, Helvetica, Arial, sans-serif"
        font-size="40" font-weight="400" fill="#4b5563">${esc(
          "Familie, Essen und Tech aus Linz",
        )}</text>

  <text x="94" y="540"
        font-family="DejaVu Sans Mono, Menlo, monospace"
        font-size="28" font-weight="400" fill="#6b7280"
        letter-spacing="2">${esc("BLOG.GNADLINGER.ME")}</text>

  <text x="${WIDTH - 90}" y="540" text-anchor="end"
        font-family="DejaVu Sans, Helvetica, Arial, sans-serif"
        font-size="28" fill="#6b7280">${esc("Johannes Gnadlinger")}</text>
</svg>
`);

await sharp(card).jpeg({ quality: 88, chromaSubsampling: "4:4:4" }).toFile(out);

console.log(`wrote ${path.relative(root, out)}`);
