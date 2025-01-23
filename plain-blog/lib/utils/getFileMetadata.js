// @ts-check
import path from "node:path";
import { PAGE_EXT_REGEX } from "./constants.js";

/**
 * @param {string} filename
 * @param {string} relativeParentDir
 * @returns {{ is404: boolean; isIndex: boolean; order: string; relativeDir: string; relativeUrl: string }}
 */
export default function getFileMetadata(filename, relativeParentDir) {
  let basename = filename.replace(PAGE_EXT_REGEX, "");
  const is404 = !relativeParentDir && basename === "404";
  const isIndex = basename === "index";
  let order = "";if (!isIndex && /^\d\d+-/.test(basename)) {
    // If the file name starts with a number with at least two digits followed by a dash, it will be treated as an ordered article.
    const matches = basename.match(/^(\d\d+)-(.*)$/);
    if (matches) {
      [, order, basename] = matches;
    }
  }
  const relativeUrl = is404
    ? "404.html"
    : [...(relativeParentDir ? relativeParentDir.split(path.sep) : []), ...(isIndex ? [] : [basename]), ""].join("/")
  const relativeDir = isIndex || is404 ? "" : basename;
  return { is404, isIndex, order, relativeDir, relativeUrl };
}
