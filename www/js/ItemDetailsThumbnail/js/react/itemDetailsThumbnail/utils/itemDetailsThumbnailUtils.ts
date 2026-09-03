import { seoName } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';
import { animationConstants } from '../constants/itemDetailsThumbnailConstants';
import urlConfigs from '../constants/urlConfigs';

export const getItemLink = (itemId: number, itemName: string, itemType: string): string => {
  let urlType = urlConfigs.assetRootUrlTemplate;
  if (itemType === 'Bundle') {
    urlType = urlConfigs.bundleRootUrlTemplate;
  }
  return `${EnvironmentUrls.websiteUrl}/${urlType}/${itemId}/${seoName.formatSeoName(itemName)}`;
};

export const getAnimationIcon = (assetTypeId: number): string => {
  switch (assetTypeId) {
    case 48:
      return animationConstants.animationIcons[48];
    case 50:
      return animationConstants.animationIcons[50];
    case 51:
      return animationConstants.animationIcons[51];
    case 52:
      return animationConstants.animationIcons[52];
    case 53:
      return animationConstants.animationIcons[53];
    case 54:
      return animationConstants.animationIcons[54];
    case 55:
      return animationConstants.animationIcons[55];
    default:
      return animationConstants.defaultAnimation;
  }
};

export default {
  getItemLink
};
