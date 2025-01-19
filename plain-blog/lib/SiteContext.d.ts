import type { Context } from "react";
import type { SiteContextValue } from "plain-blog";

export const SiteContext: Context<SiteContextValue>;
export const useSiteContext: () => SiteContextValue;
