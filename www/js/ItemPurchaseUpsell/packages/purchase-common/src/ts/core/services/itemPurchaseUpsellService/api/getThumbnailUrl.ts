import { EnvironmentUrls } from '@rbx/environment-urls';
import * as httpService from '@rbx/core-scripts/http';
import {
  ASSET_TYPE_ENUM,
  THUMBNAIL_APIS,
  THUMBNAIL_DEFAULT_REQUEST_PARAMS
} from '../constants/upsellConstants';
import { ThumbnailInfoArray } from '../constants/serviceTypeDefinitions';

export default async function getThumbnailUrl(
  assetId: number | string,
  assetType: string
): Promise<string | null> {
  let requestParam;
  let apiPath;

  if (assetType === ASSET_TYPE_ENUM.GAME_PASS) {
    apiPath = THUMBNAIL_APIS.GAME_PASS;
    requestParam = {
      gamePassIds: assetId
    };
  } else if (assetType === ASSET_TYPE_ENUM.BUNDLE) {
    apiPath = THUMBNAIL_APIS.BUNDLE;
    requestParam = {
      bundleIds: assetId
    };
  } else {
    // TODO: add more like game's thumbnail api if adding new asset types, but fall back to asset
    apiPath = THUMBNAIL_APIS.ASSET;
    requestParam = {
      assetIds: assetId
    };
  }

  requestParam = {
    ...requestParam,
    ...THUMBNAIL_DEFAULT_REQUEST_PARAMS
  };

  const urlConfig = {
    url: `${EnvironmentUrls.thumbnailsApi}${apiPath}`,
    withCredentials: true
  };

  try {
    const thumbnailData = await httpService.get<ThumbnailInfoArray>(urlConfig, requestParam);
    const [thumbnail] = thumbnailData.data.data;

    if (thumbnailData.status !== 200 || !thumbnail) {
      return Promise.resolve(null);
    }

    return Promise.resolve(thumbnail.imageUrl);
  } catch (e) {
    return Promise.resolve(null); // no stop for the upsell
  }
}
