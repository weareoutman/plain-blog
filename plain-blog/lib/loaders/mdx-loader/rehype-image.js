// @ts-check
import { readFile } from "node:fs/promises";
import path from "node:path";
import { visit } from "unist-util-visit";
import hash from "../../utils/hash.js";
import refineImage from "../../utils/refineImage.js";

export default function rehypeImage(options) {
  return async (tree) => {
    const promises = [];
    function visitor(node, index, parent) {
      if (node.tagName !== "img" || (parent.type === "element" && parent.tagName === "a")) {
        return;
      }

      const src = node.properties.src;

      if (isRelativeUrl(src)) {
        promises.push((async () => {
          const filePath = path.resolve(options.contentDir, src);
          const originalContent = await readFile(filePath);
          /** @type {Buffer} */
          let buffer;
          /** @type {boolean} */
          let link;
          if (filePath.endsWith(".svg")) {
            buffer = originalContent;
            link = false;
          } else {
            ({ buffer, link } = await refineImage(originalContent));
          }

          const filename = `${hash("sha1", buffer, 16)}${path.extname(filePath)}`;
          node.properties.src = `${options.assetsPublicPath}${filename}`;

          const asset = {
            type: "asset",
            filename,
            buffer,
          };
          options?.onEmitAsset?.(asset);

          parent.children.splice(index, 1, {
            type: "element",
            tagName: "a",
            properties: {
              href: node.properties.src,
            },
            children: [node],
          });
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
