// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const HTTP_REGEX = /^https?:/;

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
    if (!settings.extensions.some((ext) => url.endsWith(ext))) {
      return nextLoad(url);
    }

    if (HTTP_REGEX.test(url)) {
      console.log(`Fetching "${url}"`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load "${url}", status: ${response.status}`);
      }
      const buffer = await response.arrayBuffer();

      const filename = path.basename(url);
      settings.port?.postMessage({
        type: "css",
        filename,
        buffer,
      }, [buffer]);
    } else {
      const filePath = fileURLToPath(url);
      const data = await readFile(filePath);

      const filename = path.basename(filePath);

      const { buffer } = data;
      settings.port?.postMessage({
        type: "css",
        filename,
        buffer,
      }, [buffer]);
    }

    return { format: "module", shortCircuit: true, source: "" };
  }

  return { initialize, load };
}

const { initialize, load } = createHook();

export { initialize, load };
