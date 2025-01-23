// @ts-check
import path from "node:path";
import { visit } from "unist-util-visit";
import isRelativeUrl from "../../utils/isRelativeUrl.js";
import processImage from "../../utils/processImage.js";

export default function rehypeImage(options) {
  return async (tree, file) => {
    const promises = [];


    // Handle social image in frontmatter
    if (file.data.matter?.image && isRelativeUrl(file.data.matter.image) && file.history.length === 1) {
      promises.push((async() => {
        const currentFilePath = file.history[0];
        const { filename, buffer } = await processImage(path.resolve(currentFilePath, "..", file.data.matter.image));
        const asset = {
          type: "asset",
          filename,
          buffer,
        };
        options?.onEmitAsset?.(asset);
        options?.updateFrontmatter?.({
          image: `${options.assetsPublicPath}${filename}`,
        });
      })());
    }

    // Handle image tags in content
    function visitor(node, index, parent) {
      if (node.tagName !== "img" || (parent.type === "element" && parent.tagName === "a")) {
        return;
      }

      const src = node.properties?.src;

      if (isRelativeUrl(src)) {
        promises.push((async () => {
          const filePath = path.resolve(options.contentDir, src);
          const { filename, buffer, link } = await processImage(filePath);

          node.properties.src = `${options.assetsPublicPath}${filename}`;

          const asset = {
            type: "asset",
            filename,
            buffer,
          };
          options?.onEmitAsset?.(asset);

          if (link) {
            parent.children.splice(index, 1, {
              type: "element",
              tagName: "a",
              properties: {
                href: node.properties.src,
              },
              children: [node],
            });
          }
        })());
      }
    }

    visit(tree, "element", visitor);

    await Promise.all(promises);
  };
}
