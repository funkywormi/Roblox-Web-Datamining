import environmentUrls from "@rbx/environment-urls";
import chatHttpTransport from "./chatHttpTransport";

export const callBehaviour = <T>(behaviourName: string, params?: URLSearchParams): Promise<T> => {
  const search = params?.toString() ?? "";
  return chatHttpTransport.get<T>({
    // core-scripts guac is axios-only; route through the transport so Next.js uses core-lib.
    // eslint-disable-next-line no-restricted-syntax
    url: `${environmentUrls.apiGatewayUrl}/guac-v2/v1/bundles/${behaviourName}${search === "" ? "" : `?${search}`}`,
    withCredentials: true,
  });
};

export default callBehaviour;
