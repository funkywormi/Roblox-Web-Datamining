import { getAbsoluteUrl } from '@rbx/core-scripts/endpoints';
import { getDeviceMeta } from '@rbx/core-scripts/meta/device';
import { getUrlWithQueries } from '@rbx/core-scripts/util/url';
import { EnvironmentUrls } from '@rbx/environment-urls';
import * as httpService from '@rbx/core-scripts/http';
import * as upsellUtil from '@rbx/core-scripts/util/upsell';
import { GET_VNG_SHOP_URL_PATH } from '../../constants/upsellConstants';
import { GetVngShopUrlResponse } from '../../constants/serviceTypeDefinitions';

export function redirectToCustomizeAvatar() {
  const customizeAvatarUrl = getAbsoluteUrl('/my/avatar');
  if (customizeAvatarUrl !== undefined && customizeAvatarUrl !== '') {
    upsellUtil.expireUpsellCookie();
    window.location.href = customizeAvatarUrl;
  }
}

export function redirectToCatalogShop() {
  upsellUtil.expireUpsellCookie();
  window.location.href = getAbsoluteUrl('/catalog');
}

export function redirectToItemPath(itemPath: string) {
  upsellUtil.expireUpsellCookie();
  window.location.href = getAbsoluteUrl(itemPath);
}

export function redirectToRobuxStore(isTablet: boolean, isUniversalApp: boolean) {
  // (04/18/2024): Tablet UA seems to need this route specifically for prompting the native purchase prompts. This is a workaround
  // to enable Tablet UA Gamepass upsells.
  if (isTablet && isUniversalApp) {
    window.location.href = getUrlWithQueries('/Upgrades/Robux.aspx', { ctx: '' });
    return;
  }

  window.location.href = getAbsoluteUrl('/upgrades/robux?ctx=upsell');
}

async function getVngShopUrl(): Promise<string> {
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}${GET_VNG_SHOP_URL_PATH}`,
    withCredentials: true
  };

  const response = await httpService.get<GetVngShopUrlResponse>(urlConfig);

  return response.data.vngShopRedirectUrl;
}

export function redirectToVngShop(): void {
  const deviceMeta = getDeviceMeta();
  if (deviceMeta?.isDesktop && deviceMeta.isUniversalApp) {
    getVngShopUrl()
      .then(signedVngUrl => window.open(signedVngUrl, '_self'))
      .catch(() => window.open(EnvironmentUrls.vngGamesShopUrl, '_self'));
  } else {
    getVngShopUrl()
      .then(signedVngUrl => window.open(signedVngUrl, '_blank'))
      .catch(() => window.open(EnvironmentUrls.vngGamesShopUrl, '_blank'));
  }
}
