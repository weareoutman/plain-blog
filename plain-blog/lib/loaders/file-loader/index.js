// @ts-check
import { register } from "node:module";
import { MessageChannel } from "node:worker_threads";

export function createLoader() {
  let initialized = false;
  let settings = {};

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
      settings.onEmitAsset?.(asset);
    });
    port1.unref();

    register("./hook.js", {
      parentURL: import.meta.url,
      data: {
        assetsPublicPath: settings.assetsPublicPath,
        port: port2,
      },
      transferList: [port2],
    });
  }

  const flush = () => {};

  const get = () => ({});

  return { init, flush };
}

const { init, flush } = createLoader();

export { init, flush };
