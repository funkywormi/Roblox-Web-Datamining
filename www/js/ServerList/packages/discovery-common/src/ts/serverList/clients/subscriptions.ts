import { Configuration, SubscriptionsV2Api } from "@rbx/client-subscriptions-api/v1";
import environmentUrls from "@rbx/environment-urls";

const configuration = new Configuration({
  basePath: `${environmentUrls.apiGatewayUrl}/subscriptions`,
  credentials: "include",
});

export const subscriptionsV2Api = new SubscriptionsV2Api(configuration);
