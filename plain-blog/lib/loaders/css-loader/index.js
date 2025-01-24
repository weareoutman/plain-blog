// @ts-check
import { register } from "node:module";
import { MessageChannel } from "node:worker_threads";
import { TextDecoder, TextEncoder } from "node:util";
import hash from "../../utils/hash.js";
import transformCss from "../../utils/transformCss.js";

export function createLoader() {
  let initialized = false;
  let settings = {};

  const cssAssets = [];

  const init = (options) => {
    if (initialized) {
      return;
    }
    initialized = true;
    settings = {
      ...settings,
      ...options,
    };

    const { port1, port2 } = new MessageChannel();

    port1.on("message", (asset) => {
      cssAssets.push(asset);
    });
    port1.unref();

    register("./hook.js", {
      parentURL: import.meta.url,
      data: {
        port: port2,
      },
      transferList: [port2],
    });
  }

  const flush = async () => {
    if (cssAssets.length === 0) {
      return {};
    }

    const cssContent = cssAssets.map((item) => new TextDecoder().decode(item.buffer)).join("\n");

    const processedCss = await transformCss(cssContent, "main.css");

    const filename = `main.${hash("sha1", processedCss, 8)}.css`;

    const asset = {
      type: "asset",
      filename,
      buffer: new TextEncoder().encode(processedCss),
    };
    settings.onEmitAsset?.(asset);

    cssAssets.length = 0;

    return { stylesheets: [`${settings.assetsPublicPath}${asset.filename}`] };
  }

  return { init, flush };
}

const { init, flush } = createLoader();

export { init, flush };
