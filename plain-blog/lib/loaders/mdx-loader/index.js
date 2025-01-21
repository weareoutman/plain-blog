// @ts-check
import { register } from "node:module";
import { MessageChannel } from "node:worker_threads";

export function createLoader() {
  let initialized = false;
  let settings = {};

  const assets = [];
  let frontmatter;
  let summary;

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

    port1.on("message", (msg) => {
      switch (msg.type) {
        case "asset":
          settings.onEmitAsset?.(msg);
          break;
        case "frontmatter":
          if (frontmatter !== undefined) {
            console.warn("Frontmatter already set");
          }
          frontmatter = msg.value;
          break;
        case "summary":
          if (summary !== undefined) {
            console.warn("Summary already set");
          }
          summary = msg.value;
          break;
      }
    });
    port1.unref();

    register("./hook.js", {
      parentURL: import.meta.url,
      data: {
        port: port2,
        assetsPublicPath: settings.assetsPublicPath,
        contentDir: settings.contentDir,
      },
      transferList: [port2],
    });
  }

  const flush = () => {
    const result = {
      frontmatter,
      summary,
    }
    frontmatter = undefined;
    summary = undefined;
    return result;
  };

  return { init, flush };
}

const { init, flush } = createLoader();

export { init, flush };
