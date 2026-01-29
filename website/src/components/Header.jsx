// @ts-check
import React from "react";
import { useSiteContext } from "plain-blog/SiteContext";

export default function Header(props) {
  const { baseUrl, site } = useSiteContext();

  return (
    <header className="my-4">
      {props.type === "home"
        ? <h1>{site.title}</h1>
        : <a href={baseUrl}>{site.title}</a>
      }
      <a href="https://github.com/weareoutman/plain-blog">GitHub</a>
    </header>
  );
}
