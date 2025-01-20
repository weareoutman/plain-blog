import type { FC, ReactNode } from "react";

export interface SiteConfig {
  /**
   * @default "/"
   */
  baseUrl?: string;

  site?: SiteMetadata;

  output?: {
    /**
     * Output path relative to your project root
     * @default "dist"
     */
    path?: string;
  };

  posts?: {
    /**
     * Scan articles in this path relative to your project root
     * @default "posts"
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
  posts: Post[];
}

export interface Post {
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
