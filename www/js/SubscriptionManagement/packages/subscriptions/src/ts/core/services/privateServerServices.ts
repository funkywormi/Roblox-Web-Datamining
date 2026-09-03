import { httpService } from 'core-utilities';
import serviceConstants from '../constants/serviceConstants';
import {
  GetMyPrivateServersParams,
  GetMyPrivateServersResponse,
  MyPrivateServerType,
  UpdateVipServerSubscriptionRequest,
  UpdateVipServerSubscriptionResponse
} from '../types/privateServerTypes';

export const updateVipServerSubscription = async (
  body: UpdateVipServerSubscriptionRequest,
  privateServerId: string
): Promise<UpdateVipServerSubscriptionResponse> => {
  const { data } = await httpService.patch<UpdateVipServerSubscriptionResponse>(
    serviceConstants.url.updateVipServerSubscription(privateServerId),
    { ...body }
  );
  return data;
};

export const getMyPrivateServers = async (
  cursor: string,
  itemsPerPage: number
): Promise<GetMyPrivateServersResponse> => {
  const params: GetMyPrivateServersParams = {
    privateServersTab: 'MyPrivateServers',
    cursor,
    itemsPerPage
  };
  const { data } = await httpService.get<GetMyPrivateServersResponse>(
    serviceConstants.url.getMyPrivateServers(),
    params
  );
  return data;
};

const hasRobloxSubscriptionTag = (server: MyPrivateServerType): boolean =>
  server.metadata?.privateServerSubscriptionTags?.includes('RobloxSubscription') ??
  false;

const shouldRenderPrivateServer = (server: MyPrivateServerType): boolean => {
  // Private server must not be expired
  const isNotExpired = Date.parse(server.expirationDate) > Date.now();

  // Server is considered paid if price > 0 (null/undefined treated as 0)
  const isPaid = (server.priceInRobux ?? 0) > 0;

  // Server qualifies via discount if:
  // - discount exists and is > 0
  // - AND it was purchased before Roblox Subscription
  const hasValidDiscount =
    (server.totalDiscountAmountInRobux ?? 0) > 0 &&
    !hasRobloxSubscriptionTag(server);

  // Render if:
  // 1. Server is not expired
  // 2. AND (it is paid OR qualifies via discount rules)
  return isNotExpired && (isPaid || hasValidDiscount);
};

export const getAllPrivateServers = async (): Promise<MyPrivateServerType[]> => {
  const SINGLE_PAGE_SIZE = 100;
  const MAX_CALLS = 100; // To prevent infinite looping; very generous limit of 10k private servers
  let cursor = '';
  let fullList: MyPrivateServerType[] = [];
  for (let i = 0; i < MAX_CALLS; i++) {
    // sequential calls to this endpoint is required. It is highly unlikely it will loop more than once
    // eslint-disable-next-line no-await-in-loop
    const result = await getMyPrivateServers(cursor, SINGLE_PAGE_SIZE);
    fullList = [...fullList, ...result.data.filter(shouldRenderPrivateServer)];
    if (!result.nextPageCursor) break;
    cursor = result.nextPageCursor;
  }
  return fullList;
};

export default {
  updateVipServerSubscription,
  getMyPrivateServers
};
