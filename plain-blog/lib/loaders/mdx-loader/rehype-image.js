// @ts-check
import { readFile } from "node:fs/promises";
import path from "node:path";
import { visit } from "unist-util-visit";
import hash from "../../utils/hash.js";
import resizeImage from "../../utils/resizeImage.js";

// Reference https://github.com/mapbox/rehype-prism
export default function rehypeImage(options) {
  return async (tree) => {
    const promises = [];
    function visitor(node) {
      if (node.tagName !== "img") {
        return;
      }

      const src = node.properties.src;

      if (isRelativeUrl(src)) {
        promises.push((async () => {
          const filePath = path.resolve(options.postsDir, src);
          const originalContent = await readFile(filePath);
          const content = filePath.endsWith(".svg") ? originalContent : await resizeImage(originalContent);

          const basename = `${hash("sha1", content, 16)}${path.extname(filePath)}`;
          node.properties.src = `${options.assetsPublicPath}${basename}`;

          const asset = {
            type: "asset",
            filename: basename,
            buffer: content,
          };
          options?.onEmitAsset?.(asset);
        })());
      }
    }

    visit(tree, "element", visitor);

    await Promise.all(promises);
  };
}

/**
 * @param {string | null | undefined} url
 * @returns {boolean}
 */
function isRelativeUrl(url) {
  return !!url && !/^(?:\w+:)?\//.test(url);
}
