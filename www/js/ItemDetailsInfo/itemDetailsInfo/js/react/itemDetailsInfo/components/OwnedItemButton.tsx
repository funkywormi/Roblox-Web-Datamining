import React from 'react';
import { authenticatedUser, deviceMeta as DeviceMeta } from 'header-scripts';
import { CurrentUser } from 'Roblox';
import { assetTypes, assetCategory } from '../constants/categoryTranslations';
import { hrefs } from '../constants/urlConfigs';
import { itemTranslations } from '../services/translationService';

const { getInventoryUrl } = hrefs;

type TOwnedItemButtonProps = {
  assetType: number | null | undefined;
  isBundle: boolean;
};

export default function OwnedItemButton({
  assetType,
  isBundle
}: TOwnedItemButtonProps): JSX.Element {
  const deviceMetaData = DeviceMeta.getDeviceMeta();
  const inventoryUrl = getInventoryUrl(CurrentUser.userId);

  let assetCategoryType;
  if (isBundle) {
    assetCategoryType = assetCategory.Catalog;
  } else if (
    assetType === assetTypes.Plugin ||
    assetType === assetTypes.Decal ||
    assetType === assetTypes.Model ||
    assetType === assetTypes.Video ||
    assetType === assetTypes.Animation
  ) {
    assetCategoryType = assetCategory.Library;
  } else if (
    assetType === assetTypes.Place ||
    assetType === assetTypes.Badge ||
    assetType === assetTypes.GamePass ||
    assetType === assetTypes.Animation
  ) {
    assetCategoryType = null;
  } else {
    assetCategoryType = assetCategory.Catalog;
  }
  const isMobile =
    deviceMetaData?.isPhone || deviceMetaData?.isTablet || deviceMetaData?.deviceType === 'phone';

  if (assetCategoryType === assetCategory.Catalog && !isMobile) {
    return (
      <a id='edit-avatar-button' href='/my/avatar' className='btn-control-md'>
        <span className='icon-nav-charactercustomizer' />
      </a>
    );
  }

  return (
    <a id='inventory-button' href={inventoryUrl} className='btn-control-md'>
      {itemTranslations.actionInventory()}
    </a>
  );
}
