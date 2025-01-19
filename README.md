# Plain Blog

[The plain blog builder](https://weareoutman.github.io/plain-blog/) which emits zero client side JavaScript. With minimal configure, your blog will be fast and elegant.

It's fast, both at run time and build time. For [my own person blog](https://www.wangshenwei.com/), which includes a dozen of articles and about 50 images, it builds in less than 1 seconds.

Under the hood, it uses the Node.js native [module hooks](https://nodejs.org/docs/latest-v22.x/api/module.html#customization-hooks), as known as *node loaders*, to build all the pages. With module hooks, the Node.js can import files other than js, such as jsx/md/css/png, actually any files including http resources. So there are no any pack tools nor pack mechanisms involved, just several transformer tools like [MDX](https://mdxjs.com/) which supports markdown mixed with React, and [SWC](https://swc.rs/) which transforms jsx code, and [PostCSS](https://postcss.org/) which let you use tomorrow's CSS today.

And because it uses native imports, we can use `node --watch` for development, so no watch tools nor extra confitures is needed.

The whole system is extremely simple, it just works, and you can concentrate on your content.

## When should I use it

You want to build a website which serves static content only, includes a personal blog, a documentation site, etc.

Actually, you can include some `<script>` tags in your customized components, which can use traditional DOM manipulation JavaScript to implement some simple interactions. But be aware of that [React hydration](https://react.dev/reference/react-dom/client/hydrateRoot) is not supported, and likely will not be.

## When should I NOT use it

You want to build a rich client side website, which needs lots of interactions that can only be implemented by JavaScript.

## Usage

By default, the plain blog recognize the following file structure by default:

```text
your-blog
├── posts
│   ├── hello-world.md
│   ├── my-article.mdx
│   └── my-page.jsx
├── assets
│   └── favicon.png
├── dist
└── package.json
```

In most case, you need some custom css, as well as other configs to improve your blog. Just add a config file named `plain.config.js` in your project root:

```js
// @ts-check
/** @type {import("plain-blog").SiteConfig} */
export default {
  // Fill in with site metadata to improve SEO
  site: {
    title: "My Plain Blog",
    description: "Personal blog of xxx",
    url: "https://example.com",
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
```

Note: in order to enable ESM for `.js` files, you have to set `"type": "module"` for your `package.json`.

[The config](https://github.com/weareoutman/plain-blog/blob/main/plain.config.js) of our [documentation site](https://weareoutman.github.io/plain-blog/) is just as simple as above, with [several lines of css](https://github.com/weareoutman/plain-blog/blob/main/src/styles.css), it's not bad.

Wit a little more work, it can look nicer, just like [my personal blog](https://www.wangshenwei.com/).

## Features tracking

- [x] MDX pages
- [x] JSX pages
- [x] Zero client side JavaScript
- [x] SEO optimized
- [x] Auto generated index page that lists all posts
- [x] Custom css
- [x] Custom page components
- [x] Prism code blocks
- [x] Custom base url
- [x] Images (image mark in MD, imports in MD/JS)
- [x] Images optimized (auto resized to no more than 1400px wide, by default)
- [ ] Images of `url()` in css
- [ ] Nested folders of posts structure
- [ ] Social image by article
- [ ] TypeScript (wait for [Deno to support module hooks](https://github.com/denoland/deno/issues/23201))
