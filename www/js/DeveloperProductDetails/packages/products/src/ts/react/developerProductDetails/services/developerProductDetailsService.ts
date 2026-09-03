import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import constants from '../../common/constants/constants';
import {
  TDeveloperProductDetails,
  TDeveloperProductDetailsResponse
} from '../../common/types/types';

export const getDeveloperProductDetails = async (
  productId: string
): Promise<TDeveloperProductDetails> => {
  const urlConfig = constants.url.getDeveloperProductDetails(productId);
  const result = await httpService
    .get<TDeveloperProductDetailsResponse>(urlConfig)
    .then(response => response.data);
  return {
    Name: result.Name,
    Description: result.Description,
    PriceInRobux: result.PriceInRobux,
    ProductId: result.ProductId,
    CreatorId: result.Creator?.Id ?? null,
    CreatorName: result.Creator?.Name ?? null,
    CreatorType: result.Creator?.CreatorType ?? null,
    StorePageEnabled: result.StorePageEnabled ?? false,
    TargetId: result.TargetId,
    UniverseId: result.UniverseId ?? null,
    PriceDiscountDetails: result.PriceDiscountDetails ?? null,
    UserBasePriceInRobux: result.UserBasePriceInRobux ?? null
  };
};

export default { getDeveloperProductDetails };
