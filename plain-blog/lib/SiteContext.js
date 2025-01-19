import { createContext, useContext } from "react";

/**
 * @type {import("react").Context<import("plain-blog").SiteContextValue>}
 */
export const SiteContext = createContext();

export const useSiteContext = () => useContext(SiteContext);
