// @ts-check
import path from "node:path";
import { createWriteStream, existsSync } from "node:fs";
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { finished } from "node:stream/promises";
import { prerenderToNodeStream } from "react-dom/static";
import React from "react";
import { SiteContext } from "plain-blog/SiteContext";
import { flush as flushMdx } from "./loaders/mdx-loader/index.js";

const PAGE_EXT_REGEX = /\.(?:md|js)x?$/;

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
  components: { Article, Home, Header, Footer },
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
      let basename = filename.replace(PAGE_EXT_REGEX, "");
      const is404 = isRoot && basename === "404";
      const isIndex = basename === "index";
      let order = "";
      if (isIndex) {
        if (isRoot) {
          hasRootIndex = true;
        }
      } else if (/^\d\d+-/.test(basename)) {
        // If the file name starts with a number with at least two digits followed by a dash, it will be treated as an ordered article.
        const matches = basename.match(/^(\d\d+)-(.*)$/);
        if (matches) {
          [, order, basename] = matches;
          hasOrderPrefix = true;
        }
      }

      const folder = isIndex || is404 ? parentDistDir : path.join(parentDistDir, basename);
      const url = `${context.baseUrl}${basename}/`;

      // if (basename === assetsPathPart) {
      //   throw new Error("The folder of the article cannot be the same as the assets folder.");
      // }

      const Content = (await import(path.join(parentDir, filename))).default;
      const { frontmatter, summary } = await flushMdx();

      const title = frontmatter?.title;
      if (!title) {
        console.warn("No title found in", path.join(parentDir, filename));
      }

      const description = frontmatter?.description;
      const absoluteUrl = url && site.url ? new URL(url, site.url).toString() : undefined;
      const imageUrl = site.url && site.favicon ? new URL(site.favicon, site.url).toString() : undefined;

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

      const siteContext = {...context, frontmatter, summary, url, meta, Header, Footer};

      const { prelude } = await prerenderToNodeStream(
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
      const writableStream = createWriteStream(indexHtmlPath);
      prelude.pipe(writableStream);
      await finished(writableStream);

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

    const { prelude } = await prerenderToNodeStream(
      <SiteContext.Provider value={{...context, meta, Header, Footer}}>
        <Home articles={articles} />
      </SiteContext.Provider>
    );

    const writableStream = createWriteStream(listHtmlPath);
    prelude.pipe(writableStream);
    await finished(writableStream);
  }
}
