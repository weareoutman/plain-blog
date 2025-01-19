// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transformFile } from "@swc/core";

export function createHook(options) {
  let settings = {
    extensions: [".jsx"],
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

    const { code } = await transformFile(filePath, {
      filename,
      jsc: {
        target: "es2022",
        parser: {
          syntax: "ecmascript",
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
