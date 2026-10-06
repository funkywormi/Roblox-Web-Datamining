const MR_ROUTER_CONFIG_STORAGE_KEY = "Roblox.MrRouterConfig";
export const SSR_COOKIE_NAME = "mrrouter-env";

type MrRouterConfig = {
  envName: string;
  ssrCookieValue: string;
};

const emptyMrRouterConfig: MrRouterConfig = { envName: "", ssrCookieValue: "" };

const getSSRCookieValue = (): string =>
  document.cookie
    .split("; ")
    .find(cookie => cookie.startsWith(`${SSR_COOKIE_NAME}=`))
    ?.split("=")[1] ?? "";

export const getMrRouterConfig = (): MrRouterConfig => {
  try {
    const localStorageData = localStorage.getItem(MR_ROUTER_CONFIG_STORAGE_KEY);
    if (localStorageData == null) {
      return { ...emptyMrRouterConfig };
    }
    const parsed: unknown = JSON.parse(localStorageData);
    if (typeof parsed !== "object" || parsed === null) {
      return { ...emptyMrRouterConfig };
    }
    return {
      ...emptyMrRouterConfig,
      ...("envName" in parsed && typeof parsed.envName === "string" && { envName: parsed.envName }),
      ...{ ssrCookieValue: getSSRCookieValue() },
    };
  } catch {
    return { ...emptyMrRouterConfig };
  }
};

const setMrRouterSSRCookie = (envName: string): void => {
  const { hostname } = window.location;
  const domain = hostname.substring(hostname.indexOf(".") + 1);
  // If envName is null or empty, we want to delete the cookie by setting an expiry date in the past
  const expiry = envName ? "" : " expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  document.cookie = `${SSR_COOKIE_NAME}=${encodeURIComponent(envName)}; path=/; domain=.${domain};${expiry}`;
};

export const getMrRouterEnvName = (): string => getMrRouterConfig().envName;

export const setMrRouterEnvName = (envName: string | null): void => {
  const config = getMrRouterConfig();
  config.envName = envName ?? emptyMrRouterConfig.envName;
  localStorage.setItem(MR_ROUTER_CONFIG_STORAGE_KEY, JSON.stringify(config));
  setMrRouterSSRCookie(config.envName);
};
