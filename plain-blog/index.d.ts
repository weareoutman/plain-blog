import type { FC, ReactNode } from "react";

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
   * Such as "en-US", "zh-Hans-CN", etc.
   */
  locales?: string | string[];

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
    Header?: string;
    Footer?: string;
  };

  /**
   * Customize style path list relative to your project root.
   *
   * Prefix with `~` to import from node packages.
   *
   * Can be an http resource, too.
   */
  styles?: string[];
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

export interface ComponentMap {
  Home: HomeComponent;
  Article: ArticleComponent;
  Header: HeaderComponent;
  Footer: FooterComponent;
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
}

export interface SiteContextValue {
  baseUrl: string;
  site: SiteMetadata;
  url?: string;
  frontmatter?: Record<string, any>;
  summary?: string;
  meta?: Record<string, string | undefined | null>;
  stylesheets?: string[];
  Header: HeaderComponent;
  Footer: FooterComponent;
}

export interface JobContext {
  baseUrl: string;
  site: SiteMetadata;
  stylesheets?: string[];
}
