// @ts-check
import { createLoader } from "@mdx-js/node-loader";
import remarkToRehype from "remark-rehype";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import remarkExtractFrontmatter from "./remark-extract-frontmatter.js";
import rehypeImage from "./rehype-image.js";
import rehypeSummary from "./rehype-summary.js";

export function createHook(options) {
  let settings = {
    extensions: [".jsx"],
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
        remarkToRehype,
      ],
      rehypePlugins: [
        [
          rehypeSummary,
          {
            setSummary(value) {
              settings.port.postMessage({
                type: "summary",
                value,
              });
            },
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
            ...settings.shiki,
          }),
        ],
        [
          rehypeImage,
          {
            onEmitAsset(asset) {
              settings.port.postMessage(asset);
            },
            contentDir: settings.contentDir,
            assetsPublicPath: settings.assetsPublicPath,
          },
        ],
      ],
    });
  };

  const load = upstreamHook.load;

  return { initialize, load };
}

const { initialize, load } = createHook();

export { initialize, load };
