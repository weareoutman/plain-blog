// @ts-check
import { register } from "node:module";

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

    register("./hook.js", {
      parentURL: import.meta.url,
    });
  }

  const flush = () => {};

  return { init, flush };
}

const { init, flush } = createLoader();

export { init, flush };
