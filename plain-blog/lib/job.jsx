// @ts-check
import path from "node:path";
import { createWriteStream } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
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
 * @typedef {{ distDir: string; postsDir: string; components: ComponentMap; stylesheets?: string[]; context: JobContext }} JobOptions
 */

/**
 * @param {JobOptions} options
 */
export default async function job({
  distDir,
  postsDir,
  components: { Article, Home, Header, Footer },
  context,
}) {
  const posts = [];
  let hasIndex = false;
  let hasOrderPrefix = false;
  const site = context.site;

  for (const dirent of await readdir(postsDir, { withFileTypes: true })) {
    if (dirent.isFile()) {
      if (PAGE_EXT_REGEX.test(dirent.name)) {
        console.log("Building", dirent.name);
        let basename = dirent.name.replace(PAGE_EXT_REGEX, "");
        const isIndex = basename === "index";
        let order = "";
        if (isIndex) {
          hasIndex = true;
        } else if (/^\d+-/.test(basename)) {
          const matches = basename.match(/^(\d+)-(.*)$/);
          if (matches) {
            [, order, basename] = matches;
            hasOrderPrefix = true;
          }
        }

        const folder = isIndex ? distDir : path.join(distDir, basename);
        const url = `${context.baseUrl}${basename}/`;

        // if (basename === assetsPathPart) {
        //   throw new Error("The folder of the post cannot be the same as the assets folder.");
        // }

        const Content = (await import(path.join(postsDir, dirent.name))).default;
        const { frontmatter, summary } = await flushMdx();

        const title = frontmatter?.title;
        if (!title) {
          console.warn("No title found in", path.join(postsDir, dirent.name));
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

        const { prelude } = await prerenderToNodeStream(
          <SiteContext.Provider value={{...context, frontmatter, summary, url, meta, Header, Footer}}>
            <Article>
              <Content />
            </Article>
          </SiteContext.Provider>
        );

        if (!isIndex) {
          await mkdir(folder);
        }
        const indexHtmlPath = path.join(folder, "index.html");
        const writableStream = createWriteStream(indexHtmlPath);
        prelude.pipe(writableStream);
        await finished(writableStream);

        if (title) {
          posts.push({ url, title, date: frontmatter?.date, summary: summary, order });
        }
      }
    }
  }

  if (!hasIndex) {
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
      posts.sort((a, b) => a.order > b.order ? 1 : a.order < b.order ? -1 : 0);
    } else {
      posts.sort((a, b) => (+new Date(b.date)) - +(new Date(a.date)));
    }

    const listHtmlPath = path.join(distDir, "index.html");

    const { prelude } = await prerenderToNodeStream(
      <SiteContext.Provider value={{...context, meta, Header, Footer}}>
        <Home posts={posts} />
      </SiteContext.Provider>
    );

    const writableStream = createWriteStream(listHtmlPath);
    prelude.pipe(writableStream);
    await finished(writableStream);
  }
}
