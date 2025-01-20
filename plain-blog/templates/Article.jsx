// @ts-check
import React from "react";
import { useSiteContext } from "plain-blog/SiteContext";
import Page from "./Page.jsx";

/**
 * @param {import("plain-blog").ArticleProps} props
 * @returns {import("react").JSX.Element}
 */
export default function Article({ children }) {
  const { frontmatter, meta, Header, Footer } = useSiteContext();
  const title = frontmatter?.title;

  return (
    <Page title={title} meta={meta}>
      <Header type="article" />
      <main>
        <article>
          {title && <h1>{title}</h1>}
          {frontmatter?.date && <p>{frontmatter.date}</p>}
          {children}
        </article>
      </main>
      <Footer type="article" />
    </Page>
  )
}
