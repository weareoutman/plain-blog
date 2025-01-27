// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { transform } from "@swc/core";

export function createHook(options) {
  let settings = {
    extensions: [".jsx", ".ts", ".tsx"],
    ...options,
  };
  const initialize = (opts) => {
    settings = {
      ...settings,
      ...opts,
    };
  };
  const load = async (url, _context, nextLoad) => {
    if (!settings.extensions.some((ext) => url.endsWith(ext))) {
      return nextLoad(url);
    }

    const filePath = fileURLToPath(url);
    const filename = path.basename(filePath);
    const content = await readFile(filePath, "utf-8");

    // @swc/wasm has no `transformFile`
    const { code } = await transform(content, {
      filename,
      jsc: {
        target: "es2022",
        parser: {
          syntax: /\.tsx?$/.test(filename) ? "typescript" : "ecmascript",
          jsx: true,
        },
        transform: {
          react: {
            runtime: "automatic",
          }
        }
      }
    });

    return { format: "module", shortCircuit: true, source: code };
  }

  return { initialize, load };
}

const { initialize, load } = createHook();

export { initialize, load };
