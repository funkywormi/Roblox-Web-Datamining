import { EnvironmentUrls } from "Roblox";
import { httpService } from "core-utilities";

type TAccountCountryValue = {
  countryName: string;
  localizedName: string;
  countryId: number;
  subdivisionIso: string | undefined;
  localizedSubdivision: string | undefined;
};

const getAccountCountryConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.accountSettingsApi}/v1/account/settings/account-country`,
});

const getAccountCountry = async () => {
  const urlConfig = getAccountCountryConfig();
  return httpService.get<{ value: TAccountCountryValue }>(urlConfig);
};

export default getAccountCountry;
