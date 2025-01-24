// @ts-check
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "@swc/core";
import transformCss from "../../utils/transformCss.js";

export function createHook(options) {
  let settings = {
    extensions: [".css"],
    ...options,
  };
  const initialize = (opts) => {
    settings = {
      ...settings,
      ...opts,
    };
  };

  const load = async (url, context, nextLoad) => {
    const queryIndex = url.indexOf("?");
    if (queryIndex === -1) {
      return nextLoad(url);
    }

    const params = new URLSearchParams(url.slice(queryIndex + 1));
    if (!params.has("raw")) {
      return nextLoad(url);
    }

    const filePath = fileURLToPath(url.slice(0, queryIndex));
    let content = await readFile(filePath, "utf8");

    const filename = path.basename(filePath);
    const ext = path.extname(filePath);

    switch (ext) {
      case ".js": {
        const output = await transform(content, {
          filename,
          jsc: {
            target: "es2015",
            minify: {
              compress: {
                unused: true,
              },
              mangle: true,
            },
          },
          minify: true,
        });
        content = output.code;
        break;
      }
      case ".css": {
        content = await transformCss(content, filename);
        break;
      }
    }

    return {
      format: "module",
      shortCircuit: true,
      source: `export default ${JSON.stringify(content)};`,
    };
  };

  return { initialize, load };
}

const { initialize, load } = createHook();

export { initialize, load };
