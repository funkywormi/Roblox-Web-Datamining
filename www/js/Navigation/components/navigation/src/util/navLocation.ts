import { createContext, useContext } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";

/** The page URL at render time. Next.js provides the request URL; without a provider (.NET) the browser location is read. */
export type NavLocation = {
  pathname: string;
  /** Query string including the leading `?`, or empty. */
  search: string;
  href: string;
};

const browserLocation = (): NavLocation =>
  browserWindow == null
    ? { pathname: "", search: "", href: "" }
    : {
        pathname: browserWindow.location.pathname,
        search: browserWindow.location.search,
        href: browserWindow.location.href,
      };

export const NavLocationContext = createContext<NavLocation | undefined>(undefined);

export const useNavLocation = (): NavLocation =>
  useContext(NavLocationContext) ?? browserLocation();
