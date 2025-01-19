// @ts-check
import { createRequire } from "node:module";
import path from "node:path";
import { existsSync } from "node:fs";
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { init as initCss, flush as flushCss } from "./loaders/css-loader/index.js";
import { init as initFile } from "./loaders/file-loader/index.js";
import { init as initJsx } from "./loaders/jsx-loader/index.js";
import { init as initMdx } from "./loaders/mdx-loader/index.js";

const start = performance.now();

const require = createRequire(import.meta.url);

const configPath = path.join(process.cwd(), "plain.config.js");

/** @type {import("plain-blog").SiteConfig} */
const config = existsSync(configPath)
  ? (await import(configPath)).default
  : {};

const distDir = path.join(process.cwd(), config.output?.path || "dist");
const assetsPathPart = "assets";
const baseUrl = config.baseUrl || "/";
const assetsPublicPath = `${baseUrl}${assetsPathPart}/`;
const assetsDir = path.join(distDir, assetsPathPart);
const postsDir = path.resolve(process.cwd(), config.posts?.path ?? "posts");
const favicon = config.site?.favicon ?? "assets/favicon.png";

await rm(distDir, { recursive: true, force: true });
await mkdir(assetsDir, { recursive: true });

let faviconUrl;
if (favicon) {
  const faviconPath = path.resolve(process.cwd(), favicon);
  if (existsSync(faviconPath)) {
    const faviconFilename = path.basename(faviconPath);
    await copyFile(faviconPath, path.join(assetsDir, faviconFilename));
    faviconUrl = `${assetsPublicPath}${faviconFilename}`;
  }
}

const assets = [];
const onEmitAsset = (asset) => {
  assets.push(asset);
};

const loaderCommonOptions = {
  assetsPublicPath,
  postsDir,
  onEmitAsset,
};

initCss(loaderCommonOptions);
initFile(loaderCommonOptions);
initJsx(loaderCommonOptions);
initMdx(loaderCommonOptions);

/**
 * @type {import("plain-blog").SiteContextValue}
 */
const context = {
  baseUrl,
  site: {
    title: "My Blog",
    ...config.site,
    favicon: faviconUrl,
  },
};

for (const css of config.styles ?? []) {
  await import(
    css.startsWith("~")
      ? require.resolve(css.slice(1), { paths: [process.cwd()] })
      : /^https?:/.test(css)
      ? css
      : path.resolve(process.cwd(), css)
  );
}

const Article = config.components?.Article
  ? (await import(path.resolve(process.cwd(), config.components.Article))).default
  : (await import("../templates/Article.jsx")).default;
const Home = config.components?.Home
  ? (await import(path.resolve(process.cwd(), config.components.Home))).default
  : (await import("../templates/Home.jsx")).default;
const components = { Article, Home };

context.stylesheets = (await flushCss()).stylesheets;

const job = (await import("./job.jsx")).default;
await job({ distDir, postsDir, components, context });

for (const asset of assets) {
  const filePath = path.join(assetsDir, asset.filename);
  await writeFile(filePath, new Uint8Array(asset.buffer));
}

const cost = performance.now() - start;
console.log("All done in %s", `${(cost / 1000).toFixed(2)}s`);
