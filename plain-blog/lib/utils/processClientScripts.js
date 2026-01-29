// @ts-check
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";
import transformCss from "./transformCss.js";

const require = createRequire(import.meta.url);

/**
 * @param {string[]} scripts
 * @param {import("plain-blog").ScriptsConfig} config
 * @param {string} assetsDir
 * @param {string} assetsPublicPath
 * @returns {Promise<string[]>}
 */
export default function processClientScripts(scripts, config, assetsDir, assetsPublicPath) {
  return Promise.all(scripts.map(async (src) => {
    /** @type {string} */
    let sourcefile;
    /** @type {import("node:crypto").BinaryLike} */
    let content;
    if (/^https?:/.test(src)) {
      sourcefile = src;
      console.log(`Fetching "${src}"`);
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Failed to load "${src}", status: ${response.status}`);
      }
      content = await response.bytes();
    } else {
      sourcefile = src.startsWith("~")
        ? require.resolve(src.slice(1), { paths: [process.cwd()] })
        : path.resolve(process.cwd(), src);
      content = await readFile(sourcefile);
    }

    const result = await build({
      metafile: true,
      stdin: {
        contents: content,
        resolveDir: path.dirname(sourcefile),
        sourcefile,
      },
      bundle: true,
      minify: true,
      outdir: assetsDir,
      publicPath: assetsPublicPath,
      entryNames: "[hash]",
      assetNames: "[hash]",
      target: "es2015",
      loader: {
        ".svg": "text",
        ...Object.fromEntries([
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".webp",
        ].map((ext) => [ext, "file"])),
        ...config?.loader,
      },
      plugins: config?.loader?.[".css"] ? undefined : [
        {
          name: "inline-css",
          setup(build) {
            build.onResolve({ filter: /\.css$/ }, (args) => {
              return {
                path: require.resolve(args.path, { paths: [args.resolveDir] }),
                namespace: 'inline-css-ns',
              };
            });
            build.onLoad({ filter: /.*/, namespace: 'inline-css-ns' }, async (args) => {
              const originalContent = await readFile(args.path, "utf8");
              const contents = await transformCss(originalContent, path.basename(args.path));
              return {
                contents,
                watchFiles: [args.path],
                loader: 'text'
              };
            });
          },
        }
      ]
    });

    const entryPoint = Object.entries(result.metafile.outputs).find(([key, value]) => !!value.entryPoint);

    return `${assetsPublicPath}${path.relative(assetsDir, path.join(process.cwd(), entryPoint[0]))}`;
  }));
}
