import * as http from "@rbx/core-scripts/http";
import {
  TDeveloperProduct,
  TListDeveloperProductParams,
  TListStorePageDeveloperProductsResponse,
} from "../types/developerProductTypes";
import processDeveloperProductResult from "../utils/processDeveloperProductResult";
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

export default {
  getDeveloperProductsByUniverseId,
};
