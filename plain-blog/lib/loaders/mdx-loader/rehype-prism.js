// @ts-check
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import { refractor } from "refractor";

// Reference https://github.com/mapbox/rehype-prism
export default function rehypePrism() {
  function visitor(
    node,
    _index,
    parent
  ) {
    if (!parent || parent.tagName !== "pre" || node.tagName !== "code") {
      return;
    }

    const lang = getLanguage(node);

    if (lang === null) {
      return;
    }

    let result;
    try {
      parent.properties.className = (
        (parent.properties.className) || []
      ).concat("language-" + lang);
      result = refractor.highlight(toString(node), lang);
    } catch {
      return;
    }

    node.children = result.children;
  }
  return (tree) => {
    visit(tree, "element", visitor);
  };
}

function getLanguage(node) {
  const className = (node.properties.className) || [];

  for (const classListItem of className) {
    if (classListItem.slice(0, 9) === "language-") {
      return classListItem.slice(9).toLowerCase();
    }
  }

  return null;
}
