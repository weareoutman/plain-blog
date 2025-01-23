// @ts-check
import { readFile } from "node:fs/promises";
import path from "node:path";
import hash from "./hash.js";
import refineImage from "./refineImage.js";

/**
 * @param {string} filePath
 * @returns {Promise<{ filename: string; buffer: Buffer; link: boolean }>}
 */
export default async function processImage(filePath) {
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
  return { filename, buffer, link };
}
