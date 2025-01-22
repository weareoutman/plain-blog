// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import hash from "../../utils/hash.js";
import refineImage from "../../utils/refineImage.js";

export function createHook(options) {
  let settings = {
    extensions: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
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
    const originalContent = await readFile(filePath);
    /** @type {Buffer} */
    let data;
    if (filePath.endsWith(".svg")) {
      data = originalContent;
    } else {
      ({ buffer: data } = await refineImage(originalContent));
    }

    const filename = `${hash("sha1", data, 16)}${path.extname(filePath)}`;

    const { buffer } = data;
    settings.port?.postMessage({
      type: "asset",
      filename,
      buffer,
    }, [buffer]);

    return { format: "module", shortCircuit: true, source: `export default ${JSON.stringify(`${settings.assetsPublicPath}${filename}`)};` };
  }

  return { initialize, load };
}

const { initialize, load } = createHook();

export { initialize, load };
