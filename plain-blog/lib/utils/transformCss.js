// @ts-check
import postcss from "postcss";
import postcssPresetEnv from "postcss-preset-env";
import cssnano from "cssnano";
import cssnanoPresetLite from "cssnano-preset-lite";
import tailwindcss from "@tailwindcss/postcss";

/**
 * @param {string} content
 * @param {string} filename
 * @returns {Promise<string>}
 */
export default async function transformCss(content, filename) {
  const output = await postcss([
    postcssPresetEnv(),
    cssnano({
      preset: cssnanoPresetLite({
        discardComments: {
          removeAll: true,
        },
      }),
    }),
    tailwindcss(),
  ]).process(content, { from: filename });
  return output.css;
}
