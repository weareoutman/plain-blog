// @ts-check
import { visit } from "unist-util-visit";

export default function rehypeElementTransform(options) {
  const transforms = options?.transforms || {};

  return (tree) => {
    visit(tree, "element", (node) => {
      if (transforms[node.tagName]) {
        node.tagName = transforms[node.tagName];
      }
    });
  };
}
