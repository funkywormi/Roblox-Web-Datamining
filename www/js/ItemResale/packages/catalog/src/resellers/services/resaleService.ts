import { httpService } from "core-utilities";
import urlConfigs from "../constants/urlConfigs";
import {
  TCanTradeWithResponse,
  TResaleData,
  TResaleRecord,
  TResellersResponse,
} from "../constants/types";

export const resaleService = {
  getAssetResaleData: (assetId: number | string): Promise<TResaleData> =>
    httpService.get<TResaleData>(urlConfigs.getResaleData(assetId), {}).then(({ data }) => data),

  getCanTradeWith: (userId: number): Promise<TCanTradeWithResponse> =>
    httpService
      .get<TCanTradeWithResponse>(urlConfigs.getCanTradeWith(userId), {})
      .then(({ data }) => data),

  postItemDetails: (itemId: number | string): Promise<unknown> =>
    httpService
      .post(urlConfigs.postItemDetails, { items: [{ itemType: "Asset", id: itemId }] })
      .then(({ data }) => data),

  postMarketplaceItemDetails: (collectibleItemId: string): Promise<unknown> =>
    httpService
      .post(urlConfigs.postMarketplaceItemDetails, { itemIds: [collectibleItemId] })
      .then(({ data }) => data),

  getResellersForLimited2Item: (
    collectibleItemId: string,
    cursor: string,
    count: number,
  ): Promise<TResellersResponse> =>
    httpService
      .get<TResellersResponse>(urlConfigs.getResellersForLimited2Item(collectibleItemId), {
        cursor,
        limit: count,
      })
      .then(({ data }) => data),

  patchRemoveLimited2ItemFromSale: (
    collectibleItemId: string,
    resaleRecord: TResaleRecord,
    userId: number,
  ): Promise<unknown> =>
    httpService.patch(
      urlConfigs.placeLimited2ItemOnSale(
        collectibleItemId,
        resaleRecord.collectibleItemInstanceId ?? "",
      ),
      {
        price: undefined,
        isOnSale: false,
        sellerId: userId,
        sellerType: "User",
        collectibleProductId: resaleRecord.collectibleProductId,
      },
    ),

  getLimited2AssetResaleData: (collectibleItemId: string): Promise<TResaleData> =>
    httpService
      .get<TResaleData>(urlConfigs.getResaleDataForLimited2Item(collectibleItemId), {})
      .then(({ data }) => data),
};

export default resaleService;
