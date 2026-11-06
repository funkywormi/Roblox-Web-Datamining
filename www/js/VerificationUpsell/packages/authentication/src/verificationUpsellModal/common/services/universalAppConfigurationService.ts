import environmentUrls from "@rbx/environment-urls";
import transport from "../../../shared/request/requestTransport";

export default function getSettingsUIPolicy() {
  return transport
    .get({
      // core-scripts guac is axios-only; route through the transport so Next.js uses core-lib.
      // eslint-disable-next-line no-restricted-syntax
      url: `${environmentUrls.apiGatewayUrl}/guac-v2/v1/bundles/account-settings-ui`,
      withCredentials: true,
    })
    .catch(() => ({}));
}
