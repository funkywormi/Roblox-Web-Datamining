import { EnvironmentUrls } from "@rbx/legacy-webapp-types/Roblox";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import type { AxiosResponse } from "@rbx/core-scripts/http";

const getLocaleConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.localeApi}/v1/locales/user-localization-locus-supported-locales`,
});

export type GetLocaleResponse = {
  // Prefer ugc locale over generalExperience locale - for some locales
  // Cashstar has better language support than Roblox does, such as Dutch,
  // French (Canada) and Spanish (Mexico). When Cashstar does not support
  // a given locale, it defaults to en-us
  ugc: {
    locale: string;
  };
};

export const getLocale = async (): Promise<AxiosResponse<GetLocaleResponse>> => {
  const urlConfig = getLocaleConfig();

  return httpService.get(urlConfig);
};
