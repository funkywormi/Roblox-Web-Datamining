import * as cookie from "@rbx/core-lib/cookie";
import * as localStorage from "@rbx/core-lib/local-storage";

// The env name used to also live here. It is per hostname, so it drifted from the cookie.
const LEGACY_STORAGE_KEY = "Roblox.MrRouterConfig";
export const SSR_COOKIE_NAME = "mrrouter-env";

// A micro-environment lasts 24 hours.
const COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60;

declare module "@rbx/core-lib/cookie" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface CookieRegistry {
    [SSR_COOKIE_NAME]: { readonly domain: string; readonly maxAge: number };
  }
}

declare module "@rbx/core-lib/local-storage" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface LocalStorageRegistry {
    [LEGACY_STORAGE_KEY]: { readonly envName?: string };
  }
}

type MrRouterConfig = {
  envName: string;
};

// The cookie is shared by every subdomain of the current site, e.g. `.sitetest1.robloxlabs.com`.
const cookieDomain = (): string => {
  const { hostname } = window.location;
  return `.${hostname.substring(hostname.indexOf(".") + 1)}`;
};

// The cookie is the source of truth: the gateway routes on it, and it is shared across subdomains.
export const getMrRouterConfig = (): MrRouterConfig => ({
  envName: cookie.get(SSR_COOKIE_NAME)?.value ?? "",
});

export const getMrRouterEnvName = (): string => getMrRouterConfig().envName;

export const setMrRouterEnvName = (envName: string | null): void => {
  const name = envName ?? "";
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  if (name === "") {
    cookie.delete(SSR_COOKIE_NAME, { domain: cookieDomain() });
  } else {
    cookie.set(SSR_COOKIE_NAME, name, { domain: cookieDomain(), maxAge: COOKIE_MAX_AGE_SECONDS });
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
