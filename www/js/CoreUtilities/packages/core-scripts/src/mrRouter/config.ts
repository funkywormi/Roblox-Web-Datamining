const MR_ROUTER_CONFIG_STORAGE_KEY = "Roblox.MrRouterConfig";

type MrRouterConfig = {
  envName: string;
};

const emptyMrRouterConfig: MrRouterConfig = { envName: "" };

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
    };
  } catch {
    return { ...emptyMrRouterConfig };
  }
};

export const getMrRouterEnvName = (): string => getMrRouterConfig().envName;

export const setMrRouterEnvName = (envName: string | null): void => {
  const config = getMrRouterConfig();
  config.envName = envName ?? emptyMrRouterConfig.envName;
  localStorage.setItem(MR_ROUTER_CONFIG_STORAGE_KEY, JSON.stringify(config));
};
