import type { APIRoute } from "astro";
import { useStoryblokApi } from "@storyblok/astro";
import { getAllStories, contentVersion } from "../utils/storyblok";
import { renderLlmsTxt, type Story } from "../utils/llmsTxt";

/**
 * llms.txt — die Beitragsliste kommt zur Build-Zeit aus derselben Storyblok-
 * Quelle wie der RSS-Feed und die Beitragsseiten. Den Text baut
 * `renderLlmsTxt`.
 */
export const GET: APIRoute = async () => {
  const sbApi = useStoryblokApi();
  const stories: Story[] = await getAllStories(sbApi, {
    version: contentVersion,
    starts_with: "blog/",
  });

  return new Response(renderLlmsTxt(stories), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
