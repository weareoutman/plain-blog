// @ts-check
import React from "react";
import { useSiteContext } from "plain-blog/SiteContext";

export default function Footer() {
  const { site, baseUrl } = useSiteContext();

  return (
    <footer>
      <hr />
      <p style={{ display: "flex", justifyContent: "space-between" }}>
        <span>© {new Date().getFullYear()} <a href={baseUrl}>{site.title}</a></span>
        <a href="https://github.com/weareoutman/plain-blog">GitHub</a>
      </p>
    </footer>
  );
}
