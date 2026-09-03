import { Configuration, SubscriptionsV2Api } from "@rbx/client-subscriptions-api/v1";

import { getBEDEV2ServiceBasePath } from "../utils/getBasePaths";
import { getDomainInfo } from "../utils/getDomainInfo";

const domainInfo = getDomainInfo(window.location.hostname);
const configuration = new Configuration({
  robloxSiteDomain: domainInfo.rootDomain,
  basePath: getBEDEV2ServiceBasePath(domainInfo.rootDomain, "subscriptions"),
  credentials: "include",
});

export const subscriptionsV2Api = new SubscriptionsV2Api(configuration);
