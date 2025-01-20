// @ts-check
/** @type {import("plain-blog").SiteConfig} */
export default {
  // baseUrl: "/plain-blog/",
  site: {
    title: "Plain Blog",
    description: "The plain blog builder which emits zero client side JavaScript. With minimal configure, your blog will be fast and elegant.",
    favicon: "assets/favicon.svg",
    url: "https://weareoutman.github.io/plain-blog",
  },
  // posts: {
  //   path: "posts",
  // },
  components: {
    Header: "src/components/Header.jsx",
    Footer: "src/components/Footer.jsx",
    // Article: "src/components/Article.jsx",
    // Home: "src/components/Home.jsx",
  },
  styles: [
    // You can use http resources for convenient, but it slows down the build.
    // "https://unpkg.com/sanitize.css",

    // Recommend to install css packages then add them prefixed with `~`:
    "~sanitize.css",
    "~sanitize.css/typography.css",
    "~prism-themes/themes/prism-vsc-dark-plus.css",

    // Also some local css files
    "src/styles.css",
  ],
}
