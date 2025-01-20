// @ts-check
import React from "react";
import { useSiteContext } from "plain-blog/SiteContext";
import Page from "./Page.jsx";

/**
 * @param {import("plain-blog").HomeProps} props
 * @returns {import("react").JSX.Element}
 */
export default function Home({ posts }) {
  const { site, meta, Header, Footer } = useSiteContext();

  return (
    <Page title={site.title} meta={meta}>
      <Header type="home" />
      <main>
        {posts.map((post, index) => (
          <section key={index}>
            <h2>
              <a href={post.url}>{post.title}</a>
            </h2>
            {post.date && <p>{post.date}</p>}
            {post.summary && (
              <article>
                <p>{post.summary}</p>
              </article>
            )}
          </section>
        ))}
      </main>
      <Footer type="home" />
    </Page>
  )
}
