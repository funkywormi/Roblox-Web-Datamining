import {
  ConfigurationBase,
  RobloxPlusApi,
  RobloxSubscriptionMetadataApi,
  RobloxSubscriptionProductsApi,
} from "@rbx/client-roblox-subscriptions-api/v1";

import { getBEDEV2ServiceBasePath } from "../utils/getBasePaths";
import { getDomainInfo } from "../utils/getDomainInfo";

const domainInfo = getDomainInfo(window.location.hostname);
const configuration = new ConfigurationBase({
  robloxSiteDomain: domainInfo.rootDomain,
  basePath: getBEDEV2ServiceBasePath(domainInfo.rootDomain, "roblox-subscriptions"),
  credentials: "include",
});

export const robloxSubscriptionMetadataApi = new RobloxSubscriptionMetadataApi(configuration);
export const robloxPlusApi = new RobloxPlusApi(configuration);
export const robloxSubscriptionProductsApi = new RobloxSubscriptionProductsApi(configuration);
