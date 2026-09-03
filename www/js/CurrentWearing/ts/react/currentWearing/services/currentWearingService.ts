import { localStorageService } from 'core-roblox-utilities';
import { AxiosResponse } from 'axios';
import { httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';
import currentWearingContants from '../constants/currentWearingContants';

const { avatarApi, catalogApi } = EnvironmentUrls;

export type AssetDetail = {
  id: number;
  name: string;
  description: string;
  itemRestrictions?: Array<string>;
};
const getAvatarMode = (): string => {
  return (localStorageService.getLocalStorage(currentWearingContants.avatarModeKey) ||
    currentWearingContants.avatarMode.twoD) as string;
};

const setAvatarMode = (mode: string): void => {
  localStorageService.setLocalStorage(currentWearingContants.avatarModeKey, mode);
};

const getAccoutrments = async (
  userId: number
): Promise<AxiosResponse<{ assetIds?: Array<number> }>> => {
  const urlConfig = {
    url: `${avatarApi}/v1/users/${userId}/currently-wearing`,
    retryable: true,
    withCredentials: true
  };
  return httpService.get(urlConfig);
};

const getAssetsDetail = async (
  assetIds: Array<number>
): Promise<AxiosResponse<{ data?: Array<AssetDetail> }>> => {
  const urlConfig = {
    url: `${catalogApi}/v1/catalog/items/details`,
    retryable: true,
    withCredentials: true
  };
  const items = assetIds.map((assetId: number) => ({ itemType: 'Asset', id: assetId }));
  return httpService.post(urlConfig, { items });
};

const getUserId = (): number => {
  const reg = /\/users\/(\d+)\/profile/g;
  const match = reg.exec(window.location.href);
  return parseInt(match ? match[1] : '0', 10);
};

const getCurrentWearingAssets = async (): Promise<Array<AssetDetail>> => {
  const {
    data: { assetIds = [] }
  } = await getAccoutrments(getUserId());
  const {
    data: { data = [] }
  } = await getAssetsDetail(assetIds);
  return data;
};

export default {
  getAvatarMode,
  setAvatarMode,
  getAccoutrments,
  getAssetsDetail,
  getCurrentWearingAssets,
  getUserId
};
