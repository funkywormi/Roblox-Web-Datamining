import type { AxiosResponse } from '@rbx/core-scripts/http';
import * as httpService from '@rbx/core-scripts/http';
import { EnvironmentUrls } from '@rbx/environment-urls';
import {
  ItemDetailObject,
  ItemPurchaseAjaxDataObject,
  UpsellProduct
} from '../../constants/serviceTypeDefinitions';
import { GET_UPSELL_PRODUCT_API_URL } from '../../constants/upsellConstants';

export default async function fetchAvailableUpsellProduct(
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  itemDetail: ItemDetailObject,
  // When offers discount the item, re-fetch the recommended package against the
  // discounted shortfall instead of the catalog price.
  attemptRobuxAmountOverride?: number
): Promise<AxiosResponse<UpsellProduct>> {
  const userBalanceRobux = parseInt(itemPurchaseAjaxData.userBalanceRobux, 10);
  const requestBody = {
    upsell_platform: 'WEB',
    user_robux_balance: userBalanceRobux,
    attempt_robux_amount: attemptRobuxAmountOverride ?? itemDetail.expectedItemPrice
  };
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}${GET_UPSELL_PRODUCT_API_URL}`,
    withCredentials: true
  };

  try {
    return await httpService.post<UpsellProduct>(urlConfig, requestBody);
  } catch (e) {
    return Promise.reject(e);
  }
}
