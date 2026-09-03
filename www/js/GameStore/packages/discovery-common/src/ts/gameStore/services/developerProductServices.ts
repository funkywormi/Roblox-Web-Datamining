import * as http from "@rbx/core-scripts/http";
import {
  TDeveloperProduct,
  TGetGameTransactionsParams,
  TGetGameTransactionsResponse,
  TListDeveloperProductParams,
  TListStorePageDeveloperProductsResponse,
} from "../types/developerProductTypes";
import processDeveloperProductResult from "../utils/processDeveloperProductResult";
import mapDeveloperProductsAndReceipts from "../utils/mapDeveloperProductsAndReceipts";
import developerProductConstants from "../constants/developerProductConstants";

export const getDeveloperProductsByUniverseId = async (
  universeId: number,
  limit: number,
  cursor: string | undefined,
): Promise<{ nextPageCursor: string | null; developerProducts: TDeveloperProduct[] }> => {
  const urlConfig = developerProductConstants.url.getDeveloperProductsForStorePage(
    universeId.toString(),
  );
  const params: TListDeveloperProductParams = {
    cursor,
    limit,
  };
  const result = await http
    .get<TListStorePageDeveloperProductsResponse>(urlConfig, params)
    .then(response => response.data);
  return {
    nextPageCursor: result.nextPageCursor,
    developerProducts: result.developerProducts
      .map(processDeveloperProductResult)
      // map method returns null for invalid dev products
      .filter((item): item is TDeveloperProduct => item !== null),
  };
};
export const getPendingDeveloperProducts = async (
  rootPlaceId: number,
  playerId: number,
): Promise<Map<number, number>> => {
  const urlConfig = developerProductConstants.url.listGameTransactions;
  const params: TGetGameTransactionsParams = {
    placeId: rootPlaceId,
    playerId,
    status: "pending",
    locationType: "ExperienceDetailPage",
  };
  const transactions = await http
    .get<TGetGameTransactionsResponse>(urlConfig, params)
    .then(response => response.data);
  return mapDeveloperProductsAndReceipts(transactions);
};

export default {
  getDeveloperProductsByUniverseId,
  getPendingDeveloperProducts,
};
