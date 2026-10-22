import { EnvironmentUrls } from "@rbx/environment-urls";
import type { TUserSettingsAndOptionsBody } from "@rbx/user-settings";
import { APICall, HTTPVerb, withApiEvents } from "../utils/apiEventsCounter";

export const getEnablePurchasesSetting = async (): Promise<
  TUserSettingsAndOptionsBody | undefined
> =>
  withApiEvents<TUserSettingsAndOptionsBody>(HTTPVerb.GET, APICall.GET_ENABLE_PURCHASES_SETTING, {
    url: `${EnvironmentUrls.userSettingsApi}/v1/user-settings/settings-and-options?requestedUserSettings=enablePurchases`,
    withCredentials: true,
  });
