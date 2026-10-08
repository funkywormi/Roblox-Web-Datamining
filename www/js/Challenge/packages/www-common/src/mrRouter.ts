import * as cookie from "@rbx/core-lib/cookie";
import * as localStorage from "@rbx/core-lib/local-storage";

const MR_ROUTER_CONFIG_STORAGE_KEY = "Roblox.MrRouterConfig";
export const SSR_COOKIE_NAME = "mrrouter-env";

declare module "@rbx/core-lib/cookie" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface CookieRegistry {
    [SSR_COOKIE_NAME]: { readonly domain: string };
  }
}

declare module "@rbx/core-lib/local-storage" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface LocalStorageRegistry {
    [MR_ROUTER_CONFIG_STORAGE_KEY]: { readonly envName?: string };
  }
}

type MrRouterConfig = {
  envName: string;
  ssrCookieValue: string;
};

// The cookie is shared by every subdomain of the current site, e.g. `.sitetest1.robloxlabs.com`.
const cookieDomain = (): string => {
  const { hostname } = window.location;
  return `.${hostname.substring(hostname.indexOf(".") + 1)}`;
};

export const getMrRouterConfig = (): MrRouterConfig => {
  // The stored value is not validated on write, so check its shape here.
  const stored: unknown = localStorage.getItem(MR_ROUTER_CONFIG_STORAGE_KEY);
  const envName =
    typeof stored === "object" &&
    stored !== null &&
    "envName" in stored &&
    typeof stored.envName === "string"
      ? stored.envName
      : "";
  return { envName, ssrCookieValue: cookie.get(SSR_COOKIE_NAME)?.value ?? "" };
};

export const getMrRouterEnvName = (): string => getMrRouterConfig().envName;

export const setMrRouterEnvName = (envName: string | null): void => {
  const name = envName ?? "";
  localStorage.setItem(MR_ROUTER_CONFIG_STORAGE_KEY, { envName: name });
  if (name === "") {
    cookie.delete(SSR_COOKIE_NAME, { domain: cookieDomain() });
  } else {
    cookie.set(SSR_COOKIE_NAME, name, { domain: cookieDomain() });
  }
};

export type MrRouterConsoleApi = {
  getEnvName: () => string;
  setEnvName: (envName: string | null) => void;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    MrRouter?: MrRouterConsoleApi;
  }
}
