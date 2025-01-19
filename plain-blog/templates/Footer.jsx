// @ts-check
import React from "react";
import { useSiteContext } from "plain-blog/SiteContext";

export default function Footer() {
  const { site } = useSiteContext();

  return (
    <footer>
      <hr />
      <p>© {new Date().getFullYear()} {site.title}</p>
    </footer>
  );
}
