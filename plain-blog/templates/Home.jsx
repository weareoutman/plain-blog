// @ts-check
import React from "react";
import { useSiteContext } from "plain-blog/SiteContext";

/**
 * @param {import("plain-blog").HomeProps} props
 * @returns {import("react").JSX.Element}
 */
export default function Home({ articles }) {
  const { site, meta, Page, Header, Footer } = useSiteContext();

  return (
    <Page title={site.title} meta={meta}>
      <Header type="home" />
      <main>
        {articles.map((article, index) => (
          <section key={index}>
            <h2>
              <a href={article.url}>{article.title}</a>
            </h2>
            {article.date && <p>{article.date}</p>}
            {article.summary && (
              <article>
                <p>{article.summary}</p>
              </article>
            )}
          </section>
        ))}
      </main>
      <Footer type="home" />
    </Page>
  )
}
