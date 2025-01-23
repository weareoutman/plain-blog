---
title: Introducing Plain Blog
---

[The Plain Blog builder](https://plain-blog.js.org/) which emits zero client-side JavaScript. With minimal configuration, your blog will be fast and elegant.

Although it emits no JavaScript to the the client-side, you can composite your page layout using React components, writing content in markdown or MDX. So blogs built with similar tech like [Gatsby](https://www.gatsbyjs.com/) can migrate to Plain Blog with little effort.

It's fast, both at run time and build time. For [my own personal blog](https://www.wangshenwei.com/), which includes a dozen of articles and about 50 images, it builds in less than 1 second on my Mac. While it was using Gatsby, it would take about 30 seconds for a cold build, and 10 seconds for a warm build.

Under the hood, it uses the Node.js native [module hooks](https://nodejs.org/docs/latest-v22.x/api/module.html#customization-hooks), as known as *node loaders*, to build all the pages. With module hooks, Node.js can import files other than js, such as jsx/md/css/png, actually any specifiers including http resources. So there are no any pack tools nor pack mechanisms involved, just several transformer tools like [MDX](https://mdxjs.com/) which supports markdown mixed with React, and [SWC](https://swc.rs/) which transforms jsx code, and [PostCSS](https://postcss.org/) which let you use tomorrow's CSS today.

And because it uses native imports, we can use `node --watch` for development, so no watch tools nor extra configs are needed.

The whole system is pretty simple, it just works, and you can concentrate on creating your content.

Check the source code out on GitHub: [https://github.com/weareoutman/plain-blog](https://github.com/weareoutman/plain-blog).

For beginners, try this template repo on Github: [https://github.com/weareoutman/plain-blog-template](https://github.com/weareoutman/plain-blog-template).

## When should I use it

You want to build a website which serves static content only, includes a personal blog, a documentation site, etc.

You can include some `<script>` tags in your customized components if you have to, which can use traditional DOM manipulation JavaScript to implement some simple interactions. But be aware of that [React hydration](https://react.dev/reference/react-dom/client/hydrateRoot) is not supported, and likely will not be.

## When should I NOT use it

You want to build a rich client-side website, which needs lots of interactions that can only be implemented with JavaScript.

## Usage

You can try this template repo on Github: [https://github.com/weareoutman/plain-blog-template](https://github.com/weareoutman/plain-blog-template), or build it from the ground up.

By default, the Plain Blog recognize the following file structure by default:

```text
your-blog
├── content
│   ├── hello-world.md
│   ├── my-article.mdx
│   └── my-page.jsx
├── assets
│   └── favicon.png
├── dist
└── package.json
```

For md/mdx/jsx files in content, they will be compiled to html files. For example `content/hello-world.md` will compiled to `dist/hello-world/index.html`, so you can visit `/hello-world/` from your website. For other files in content not starting with a dot, will be copied as it is.

If you choose to build it from scratch, first create `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "build": "plain-blog",
    "dev": "NODE_ENV=development plain-blog",
    "watch": "NODE_ENV=development plain-blog node --watch ./node_modules/.bin/plain-blog",
    "serve": "serve dist"
  },
  "devDependencies": {
    "plain-blog": ">=0.4.0",
    "serve": "^14.2.4"
  }
}
```

Then run `npm install && npm run build`. And your site has been built, run `npm run serve`, or serve the `dist` folder with any static server.

The index page may have only a header and footer by now, try adding some markdown files in `articles`, and run `npm run build` again.

In most case, you need some custom css, as well as other configs to improve your blog. Add a config file named `plain.config.js` in your project root:

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
    // "~sanitize.css",
    // "~sanitize.css/typography.css",

    // Also some local css files
    "src/styles.css",
  ],
}
```

With a little more work, such as [customizing components](https://github.com/weareoutman/wangshenwei.com/blob/master/plain.config.js), it can look nicer, just like [my personal blog](https://www.wangshenwei.com/).

Read more:

- [Features tracking](01-features-tracking.md)
- [Customizing components](02-customizing-components.md)
- To be continued...

## License

MIT
