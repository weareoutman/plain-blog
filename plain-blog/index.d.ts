import type { RehypeShikiOptions } from "@shikijs/rehype";
import type { FC, PropsWithChildren, ReactNode } from "react";
import type { Loader } from "esbuild";

export interface SiteConfig {
  /**
   * @default "/"
   */
  baseUrl?: string;

  site?: SiteMetadata;

  /**
   * Used for [`Intl.Segmenter()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)
   * when generating article summary for the home page.
   *
   * Such as "en", "en-US", "zh-Hans-CN", etc.
   *
   * The first locale will also be used as the `lang` attribute value of the html tag by default.
   */
  locales?: string[];

  output?: {
    /**
     * Output path relative to your project root
     * @default "dist"
     */
    path?: string;
  };

  content?: {
    /**
     * Convert md/mdx/jsx files as articles in this path,
     * and copy other files not started with a dot to the output directory.
     *
     * @default "content"
     */
    path?: string;
  };

  /**
   * Customize components
   */
  components?: {
    /**
     * Home component path relative to your project root,
     * such as `src/components/Home.jsx`
     */
    Home?: string;
    /**
     * Article component path relative to your project root,
     * such as `src/components/Article.jsx`
     */
    Article?: string;
    Page?: string;
    Header?: string;
    Footer?: string;
  };

  /** Whether to enable TOC (table of contents) */
  toc?: boolean;

  /**
   * Options for code highlighting tool Shiki
   *
   * @default {langs:["js","jsx","ts","tsx","json","css","html","xml","md","mdx","shell"],theme:"dark-plus"}
   */
  shiki?: RehypeShikiOptions;

  /**
   * Customize CSS path list relative to your project root.
   *
   * CSS files will be processed by PostCSS, so you can use tomorrow's CSS today.
   *
   * Prefix with `~` to import from node packages.
   *
   * Can be an http resource, too.
   */
  styles?: string[];

  /**
   * In case you do need some client-side JavaScript anyway,
   * add a list of JS path list relative to your project root.
   *
   * JS files will be bundled by esbuild, by default:
   *
   * - SVG files will be loaded as text.
   * - CSS files will be processed by PostCSS and then loaded as text.
   * - Images will be loaded as file.
   *
   * Set `scriptsConfig` to override the default behavior.
   *
   * Prefix with `~` to import from node packages.
   *
   * Can be an http resource, too.
   */
  scripts?: string[];

  scriptsConfig?: ScriptsConfig;
}

export interface ScriptsConfig {
  /** esbuild loader options */
  loader?: { [ext: string]: Loader };
}

export interface HomeProps {
  articles: Article[];
}

export interface Article {
  url: string;
  title: string;
  summary?: string;
  date?: string;
}

export type HomeComponent = FC<HomeProps>;

export interface ArticleProps {
  children?: ReactNode;
}

export type ArticleComponent = FC<ArticleProps>;

export type HeaderComponent = FC<{ type?: "home" | "article" }>;

export type FooterComponent = FC<{ type?: "home" | "article" }>;

export interface PageProps extends PropsWithChildren {
  title?: string;
  meta?: Record<string, string | undefined | null>;
}

export type PageComponent = FC<PageProps>;

export interface ComponentMap {
  Home: HomeComponent;
  Article: ArticleComponent;
  Header: HeaderComponent;
  Footer: FooterComponent;
  Page: PageComponent;
}

export interface SiteMetadata {
  /** Site title */
  title?: string;
  /** Site description */
  description?: string;
  /** The path of favicon relative to your project root */
  favicon?: string;
  /** The website url, such as `https://example.com` */
  url?: string;

  [key: string]: any;
}

export interface SiteContextValue {
  baseUrl: string;
  site: SiteMetadata;
  url?: string;
  frontmatter?: Record<string, any>;
  summary?: string;
  toc?: TocNode[];
  meta?: Record<string, string | undefined | null>;
  locales?: string[];

  /**
   * CSS url list.
   *
   * Usage in your component:
   *
   * ```jsx
   * {stylesheets?.map((url) => (
   *   <link key={url} rel="stylesheet" href={url} />
   * )}
   * ```
   */
  stylesheets?: string[];

  /**
   * JS url list.
   *
   * Usage in your component:
   *
   * ```jsx
   * {scripts?.map((url) => (
   *   <script key={url} src={url} async />
   * )}
   * ```
   */
  scripts?: string[];
  Page: PageComponent;
  Header: HeaderComponent;
  Footer: FooterComponent;
}

export interface JobContext {
  baseUrl: string;
  site: SiteMetadata;
  locales?: string[];
  stylesheets?: string[];
  scripts?: string[];
  toc?: boolean;
}

export interface TocNode {
  text: string;
  id: string;
  depth: number;
  children: TocNode[];
}
