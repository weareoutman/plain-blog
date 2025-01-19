// @ts-check
import { createLoader } from "@mdx-js/node-loader";
import remarkToRehype from "remark-rehype";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkExtractFrontmatter from "./remark-extract-frontmatter.js";
import rehypePrism from "./rehype-prism.js";
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
            }
          }
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
        rehypePrism,
        [
          rehypeImage,
          {
            onEmitAsset(asset) {
              settings.port.postMessage(asset);
            },
            postsDir: settings.postsDir,
            assetsPublicPath: settings.assetsPublicPath,
          },
        ]
      ],
    });
  };

  const load = upstreamHook.load;

  return { initialize, load };
}

const { initialize, load } = createHook();

export { initialize, load };
