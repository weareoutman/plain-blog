// @ts-check
import path from "node:path";
import { visit } from "unist-util-visit";
import getFileMetadata from "../../utils/getFileMetadata.js";
import isRelativeUrl from "../../utils/isRelativeUrl.js";

const PAGE_EXT_REGEX = /\.(?:mdx?|jsx)$/;

export default function rehypeLink(options) {
  return (tree, file) => {
    if (file.history.length !== 1) {
      console.warn("file.history.length !== 1", file.history);
      return;
    }
    const currentFilePath = file.history[0];

    function visitor(node) {
      if (node.tagName !== "a" || !node.properties?.href) {
        return;
      }
      const { href } = node.properties;

      if (!isRelativeUrl(href) || !PAGE_EXT_REGEX.test(href) || !file.history.length) {
        return;
      }
      const targetFilePath = path.resolve(path.dirname(currentFilePath), href);
      if (!targetFilePath.startsWith(options.contentDir + path.sep)) {
        throw new Error(`Invalid link "${href}": outside of content directory`);
      }

      const relativeParentDir = path.relative(options.contentDir, path.dirname(targetFilePath));
      const { relativeUrl } = getFileMetadata(
        path.basename(targetFilePath),
        relativeParentDir
      );
      node.properties.href = `${options.baseUrl}${relativeUrl}`;
    }

    visit(tree, "element", visitor);
  };
}
