// @ts-check
import React from "react";
import { useSiteContext } from "plain-blog/SiteContext";

/**
 * @param {import("plain-blog").ArticleProps} props
 * @returns {import("react").JSX.Element}
 */
export default function Article({ children }) {
  const { frontmatter, toc, meta, Page, Header, Footer } = useSiteContext();
  const { title, date } = frontmatter ?? {};

  return (
    <Page title={title} meta={meta}>
      <Header type="article" />
      <main>
        <article>
          {title && <h1>{title}</h1>}
          {date && <p>{date}</p>}
          {children}
        </article>
        {!!toc?.length && (
          <nav>
            <TocTree toc={toc} />
          </nav>
        )}
      </main>
      <Footer type="article" />
    </Page>
  );
}

function TocTree({ toc }) {
  return (
    <ul>
      {toc.map(({ id, text, children }) => (
        <li key={id}>
          <a href={`#${id}`}>{text}</a>
          {!!children.length && <TocTree toc={children} />}
        </li>
      ))}
    </ul>
  );
}
