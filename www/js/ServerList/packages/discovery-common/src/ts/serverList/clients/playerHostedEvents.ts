import {
  Configuration,
  RobloxPlayerhostedeventsPlayerhostedeventsV1beta1PlayerHostedEventsAPIApi,
} from "@rbx/client-player-hosted-events-api/v1";
import environmentUrls from "@rbx/environment-urls";

const configuration = new Configuration({
  basePath: `${environmentUrls.apiGatewayUrl}/player-hosted-events`,
  credentials: "include",
});

export const playerHostedEventsApi =
  new RobloxPlayerhostedeventsPlayerhostedeventsV1beta1PlayerHostedEventsAPIApi(configuration);
