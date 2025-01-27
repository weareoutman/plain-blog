// @ts-check
import { createLoader } from "@mdx-js/node-loader";
import remarkToRehype from "remark-rehype";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkCustomHeaderId from "remark-custom-header-id";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import { transformerColorizedBrackets } from "@shikijs/colorized-brackets";
import remarkExtractFrontmatter from "./remark-extract-frontmatter.js";
import rehypeImage from "./rehype-image.js";
import rehypeSummary from "./rehype-summary.js";
import rehypeLink from "./rehype-link.js";
import rehypeTitle from "./rehype-title.js";
import rehypeExtractToc from "./rehype-extract-toc.js";

export function createHook(options) {
  let settings = {
    ...options,
  };
  const upstreamHook = createLoader();

  const initialize = (opts) => {
    settings = {
      ...settings,
      ...opts,
    };

    return upstreamHook.initialize({
      remarkPlugins: [
        remarkGfm,
        remarkFrontmatter,
        [
          remarkExtractFrontmatter,
          {
            addFrontmatter(value) {
              settings.port.postMessage({
                type: "frontmatter",
                value,
              });
            },
          },
        ],
        remarkCustomHeaderId,
        remarkToRehype,
      ],
      rehypePlugins: [
        [
          rehypeTitle,
          {
            updateFrontmatter(value) {
              settings.port.postMessage({
                type: "frontmatter.update",
                value,
              });
            },
          }
        ],
        [
          rehypeSummary,
          {
            locales: settings.locales,
            setSummary(value) {
              settings.port.postMessage({
                type: "summary",
                value,
              });
            },
          },
        ],
        [
          rehypeLink,
          {
            contentDir: settings.contentDir,
            baseUrl: settings.baseUrl,
          },
        ],
        [
          rehypeShiki,
          /** @type {import("@shikijs/rehype").RehypeShikiOptions} */
          ({
            langs: [
              "js",
              "jsx",
              "ts",
              "tsx",
              "json",
              "css",
              "html",
              "xml",
              "md",
              "mdx",
              "shell",
            ],
            theme: "dark-plus",
            transformers: [transformerColorizedBrackets()],
            ...settings.shiki,
          }),
        ],
        [
          rehypeImage,
          {
            onEmitAsset(asset) {
              settings.port.postMessage(asset);
            },
            updateFrontmatter(value) {
              settings.port.postMessage({
                type: "frontmatter.update",
                value,
              });
            },
            contentDir: settings.contentDir,
            assetsPublicPath: settings.assetsPublicPath,
          },
        ],
        rehypeSlug,
        [rehypeExtractToc, {
          setToc(value) {
            settings.port.postMessage({
              type: "toc",
              value,
            });
          },
        }],
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
      ],
    });
  };

  const load = upstreamHook.load;

  return { initialize, load };
}

const { initialize, load } = createHook();

export { initialize, load };
