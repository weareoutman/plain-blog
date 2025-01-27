// @ts-check
import { SKIP, visit } from "unist-util-visit";
import {toString} from "hast-util-to-string";

const SUB_HEADINGS = ["h2", "h3", "h4", "h5", "h6"];

/** @typedef {import("plain-blog").TocNode} TocNode */

export default function rehypeExtractToc(options) {
  return (tree, file) => {
    /** @type {TocNode[]} */
    const toc = [];

    /** @type {TocNode[]} */
    const stack = [];

    visit(tree, "element", (node) => {
      if (!(node.type === "element" && SUB_HEADINGS.includes(node.tagName) && node.properties.id)) {
        return;
      }

      const depth = parseInt(node.tagName[1]);
      const text = toString(node);

      /** @type {TocNode} */
      const tocNode = {
        text,
        id: node.properties.id,
        depth,
        children: [],
      };

      while (stack.length && stack[stack.length - 1].depth >= depth) {
        stack.pop();
      }
      if (stack.length) {
        stack[stack.length - 1].children.push(tocNode);
        stack.push(tocNode);
      } else {
        stack.push(tocNode);
        toc.push(tocNode);
      }

      return SKIP;
    });

    file.data.toc = toc;
    options?.setToc?.(toc);
  };
}
