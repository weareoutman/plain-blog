// @ts-check
import { visit } from "unist-util-visit";

const segmenterFr = new Intl.Segmenter("zh-Hans-CN", {
  granularity: "word",
});

// Reference https://github.com/mapbox/rehype-prism
export default function rehypeSummary(options) {
  return (tree) => {
    /** @type {string[]} */
    const summary = [];
    let restWords = 42;
    visit(tree, "text", (node, _index, parent) => {
      if (restWords <= 0 || (parent?.type === "mdxJsxTextElement" && parent.name === "footer")) {
        return;
      }
      for (const item of segmenterFr.segment(node.value)) {
        if (item.isWordLike) {
          summary.push(item.segment);
          restWords--;
        } else {
          summary.push(item.segment);
        }
        if (restWords <= 0) {
          break;
        }
      }
    });
    summary.push("…");
    options?.setSummary?.(summary.join(""));
  };
}
