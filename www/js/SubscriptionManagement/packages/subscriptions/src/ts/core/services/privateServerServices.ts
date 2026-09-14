import { httpService } from "core-utilities";
import { Configuration, PrivateServersApi } from "@rbx/client-private-servers-api-v2/v2";
import environmentUrls from "@rbx/environment-urls";
import serviceConstants from "../constants/serviceConstants";
import {
  UpdateVipServerSubscriptionResponse,
  UpdateVipServerSubscriptionRequest,
  UpdateVipServerSubscriptionRaw,
} from "../types/privateServerTypes";

export const privateServersApi = new PrivateServersApi(
  new Configuration({
    basePath: `${environmentUrls.apiGatewayUrl}/private-servers-api-v2`,
    credentials: "include",
  }),
);

export const updateVipServerSubscription = async (
  body: UpdateVipServerSubscriptionRequest,
  privateServerId: string,
): Promise<UpdateVipServerSubscriptionResponse> => {
  const { data } = await httpService.patch<UpdateVipServerSubscriptionRaw>(
    serviceConstants.url.updateVipServerSubscription(privateServerId),
    { ...body },
  );
  return { ...data, expirationDate: new Date(data.expirationDate) };
};

export default {
  updateVipServerSubscription,
};
