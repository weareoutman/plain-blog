// @ts-check
import React from "react";
import { useSiteContext } from "plain-blog/SiteContext";

/**
 *
 * @param {import("react").PropsWithChildren<{ title?: string; meta?: Record<string, string | undefined | null> }>} props
 * @returns
 */
export default function Page({
  title,
  meta,
  children
}) {
  const { stylesheets, site, locales, scripts, } = useSiteContext();

  return (
    <html lang={locales?.[0]}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        {meta && Object.entries(meta).map(([name, content]) => (
          content && (<meta key="name" name={name} content={content} />)
        ))}
        {site.favicon && <link rel="icon" href={site.favicon} />}
        <style>{`.shiki{padding:1em;font-size:14px}`}</style>
        {stylesheets?.map((url) => (
          <link key={url} rel="stylesheet" href={url} />
        ))}
        {scripts?.map((url) => (
          <script key={url} src={url} async />
        ))}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
