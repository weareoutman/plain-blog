// @ts-check
import React from "react";
import { useSiteContext } from "plain-blog/SiteContext";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import Page from "./Page.jsx";

/**
 * @param {import("plain-blog").ArticleProps} props
 * @returns {import("react").JSX.Element}
 */
export default function Article({ children }) {
  const { frontmatter, meta } = useSiteContext();
  const title = frontmatter?.title;

  return (
    <Page title={title} meta={meta}>
      <Header />
      <main>
        <article>
          {title && <h1>{title}</h1>}
          {frontmatter?.date && <p>{frontmatter.date}</p>}
          {children}
        </article>
      </main>
      <Footer />
    </Page>
  )
}
