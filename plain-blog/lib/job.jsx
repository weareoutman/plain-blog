// @ts-check
import path from "node:path";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { SiteContext } from "plain-blog/SiteContext";
import { flush as flushMdx } from "./loaders/mdx-loader/index.js";
import getFileMetadata from "./utils/getFileMetadata.js";

const PAGE_EXT_REGEX = /\.(?:mdx?|jsx)$/;

/**
 * @typedef {import("react").FC<P>} FC<P>
 * @template {{}} P
 */

/**
 * @typedef {import("plain-blog").ComponentMap} ComponentMap
 * @typedef {import("plain-blog").SiteContextValue} SiteContextValue
 * @typedef {import("plain-blog").JobContext} JobContext
 * @typedef {{ distDir: string; contentDir: string; components: ComponentMap; stylesheets?: string[]; context: JobContext }} JobOptions
 */

/**
 * @param {JobOptions} options
 */
export default async function job({
  distDir,
  contentDir,
  components: { Article, Home, Page, Header, Footer },
  context,
}) {
  const articles = [];
  let hasRootIndex = false;
  let hasOrderPrefix = false;
  const site = context.site;

  /**
   * @param {string} filename
   * @param {string} parentDir
   * @param {string} parentDistDir
   */
  const handleFile = async (filename, parentDir, parentDistDir) => {
    if (PAGE_EXT_REGEX.test(filename)) {
      console.log("Building", filename);
      const isRoot = parentDir === contentDir;
      const relativeParentDir = path.relative(distDir, parentDistDir);
      const { isIndex, is404, order, relativeDir, relativeUrl } = getFileMetadata(filename, relativeParentDir);
      if (isIndex && isRoot) {
        hasRootIndex = true;
      }
      if (order) {
        hasOrderPrefix = true;
      }

      const folder = path.join(parentDistDir, relativeDir);
      const url = `${context.baseUrl}${relativeUrl}`;

      const Content = (await import(path.join(parentDir, filename))).default;
      const { frontmatter, summary } = await flushMdx();

      const title = frontmatter?.title;
      if (!title) {
        console.warn("No title found in", path.join(parentDir, filename));
      }

      const description = frontmatter?.description;
      const absoluteUrl = url && site.url ? new URL(url, site.url).toString() : undefined;
      const imageUrl = frontmatter?.image ?? (site.url && site.favicon ? new URL(site.favicon, site.url).toString() : undefined);

      const meta = {
        title,
        description,

        "og:site_name": site.title,
        "og:title": title,
        "og:type": "article",
        "og:url": absoluteUrl,
        "og:description": description,
        "og:image": imageUrl,

        "twitter:card": "summary",
        "twitter:url": absoluteUrl,
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": imageUrl,
      };

      const siteContext = {...context, frontmatter, summary, url, meta, Page, Header, Footer};

      const indexHtmlContent = await renderToStaticMarkup(
        <SiteContext.Provider value={siteContext}>
          <Article>
            <Content {...siteContext} />
          </Article>
        </SiteContext.Provider>
      );

      if (!isIndex && !is404) {
        await mkdir(folder);
      }
      const indexHtmlPath = is404 ? path.join(folder, "404.html") : path.join(folder, "index.html");
      await writeFile(indexHtmlPath, indexHtmlContent);

      if (title && !is404) {
        articles.push({ url, title, date: frontmatter?.date, summary: summary, order });
      }
    } else if (!filename.startsWith(".")) {
      // Copy files other than md/mdx/jsx and not started with a dot.
      await copyFile(path.join(parentDir, filename), path.join(parentDistDir, filename));
    }
  };

  /**
   * @param {string} parentDir
   * @param {string} parentDistDir
   */
  const handleDirectory = async (parentDir, parentDistDir) => {
    if (!existsSync(parentDistDir)) {
      await mkdir(parentDistDir);
    }
    for (const dirent of await readdir(parentDir, { withFileTypes: true })) {
      await handleDirent(dirent, parentDir, parentDistDir);
    }
  };

  /**
   * @param {import("node:fs").Dirent} dirent
   * @param {string} parentDir
   * @param {string} parentDistDir
   */
  const handleDirent = async (dirent, parentDir, parentDistDir) => {
    if (dirent.isFile()) {
      await handleFile(dirent.name, parentDir, parentDistDir);
    } else if (dirent.isDirectory()) {
      await handleDirectory(path.join(parentDir, dirent.name), path.join(parentDistDir, dirent.name));
    }
  };

  await handleDirectory(contentDir, distDir);

  if (!hasRootIndex) {
    const imageUrl = site.url && site.favicon ? new URL(site.favicon, site.url).toString() : undefined;
    const meta = {
      title: site.title,
      description: site.description,

      "og:site_name": site.title,
      "og:title": site.title,
      "og:type": "website",
      "og:url": site.url,
      "og:description": site.description,
      "og:image": imageUrl,

      "twitter:card": "summary",
      "twitter:url": site.url,
      "twitter:title": site.title,
      "twitter:description": site.description,
      "twitter:image": imageUrl,
    };

    if (hasOrderPrefix) {
      articles.sort((a, b) => a.order > b.order ? 1 : a.order < b.order ? -1 : 0);
    } else {
      articles.sort((a, b) => (+new Date(b.date)) - +(new Date(a.date)));
    }

    const listHtmlPath = path.join(distDir, "index.html");
    const listHtmlContent = await renderToStaticMarkup(
      <SiteContext.Provider value={{...context, meta, Page, Header, Footer}}>
        <Home articles={articles} />
      </SiteContext.Provider>
    );

    await writeFile(listHtmlPath, listHtmlContent);
  }
}
