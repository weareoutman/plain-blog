// @ts-check
/**
 * @param {string | null | undefined} url
 * @returns {boolean}
 */
export default function isRelativeUrl(url) {
  return !!url && !/^(?:\w+:)?\//.test(url);
}
