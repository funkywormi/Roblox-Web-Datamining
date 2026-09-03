import { Configuration, RobuxTransferApi } from "@rbx/client-transfer-api/v1";
import environmentUrls from "@rbx/environment-urls";

const configuration = new Configuration({
  basePath: `${environmentUrls.apiGatewayUrl}/transfer`,
  credentials: "include",
});

export const robuxTransferApiClient = new RobuxTransferApi(configuration);
