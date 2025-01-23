// @ts-check
import { fileURLToPath } from "node:url";
import processImage from "../../utils/processImage.js";

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
    const { filename, buffer: { buffer } } = await processImage(filePath);

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
