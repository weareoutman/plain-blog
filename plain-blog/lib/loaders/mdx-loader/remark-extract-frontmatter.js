// @ts-check
import { visit } from "unist-util-visit";
import { JSON_SCHEMA, load } from "js-yaml";

export default function remarkExtractFrontmatter(options) {
  return (tree, file) => {
    visit(tree, "yaml", (node) => {
      const matter = load(node.value, {
        schema: JSON_SCHEMA,
        json: true,
      });
      file.data.matter = matter;
      options?.addFrontmatter(matter);
    });
  };
}
