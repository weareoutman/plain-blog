// @ts-check
import { createHash } from "node:crypto";

/**
 *
 * @param {string} algorithm
 * @param {import("node:crypto").BinaryLike} data
 * @param {number=} length
 * @returns {string}
 */
export default function hash(algorithm, data, length) {
  const hash = createHash(algorithm);
  hash.update(data);
  const result = hash.digest("hex");
  return length ? result.substring(0, length) : result;
}
