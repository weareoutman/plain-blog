// @ts-check
import { EXIT, visit } from "unist-util-visit";

export default function rehypeTitle(options) {
  return (tree, file) => {
    if (file.data?.matter?.title) {
      return;
    }

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName === "h1") {
        if (!file.data?.matter?.title) {
          const titleTexts = [];
          visit(node, "text", (text, _i, p) => {
            if (p !== node) {
              console.warn("Child elements of <h1> will be converted tp plain text");
            }
            titleTexts.push(text.value);
          });

          options?.updateFrontmatter?.({
            title: titleTexts.join(""),
          });
        }

        parent.children.splice(index, 1);
        return EXIT;
      }
    });
  };
}
