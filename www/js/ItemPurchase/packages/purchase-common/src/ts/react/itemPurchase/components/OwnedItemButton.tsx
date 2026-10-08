import React from 'react';
import { userId } from '@rbx/core-scripts/meta/user';
import { deviceMeta as DeviceMeta } from '@rbx/core-scripts/legacy/header-scripts';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import urlConstants from '../constants/urlConstants';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { itemNamespaces, useItemTranslate, type PurchaseTranslate } from '../useTranslate';

const { resources, assetTypes, assetCategory } = itemPurchaseConstants;
const { getInventoryUrl } = urlConstants;

interface OwnedItemButtonProps {
  translate?: PurchaseTranslate;
  assetType: number;
}

function OwnedItemButton({ translate, assetType }: OwnedItemButtonProps & { translate: PurchaseTranslate }) {
  const deviceMetaData = DeviceMeta.getDeviceMeta();
  const legacyDeviceFlags: Record<string, unknown> = DeviceMeta;
  const isInPhone = deviceMetaData?.deviceType === 'phone';
  const inventoryUrl = getInventoryUrl(userId()!);
  let assetCategoryType;
  if (
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

  const isNavigationToInAppAvatarEditorEnabled = () => {
    if (assetCategoryType !== assetCategory.Catalog || deviceMetaData?.isInApp) {
      return false;
    }
    // TODO(WEB-3440): these flags live on the getDeviceMeta() result (`deviceMetaData`), not on
    // the `DeviceMeta` module (read via `legacyDeviceFlags`), so this condition is always false (unchanged from the legacy .jsx).
    // Re-point them at `deviceMetaData` in a follow-up once the in-app avatar-editor deep link is
    // validated, rather than silently enabling it here.
    if (
      (legacyDeviceFlags.isAndroidApp || legacyDeviceFlags.isIosApp) &&
      (legacyDeviceFlags.isPhone || legacyDeviceFlags.isTablet)
    ) {
      return true;
    }
    return false;
  };

  if (isNavigationToInAppAvatarEditorEnabled()) {
    return (
      <a id='open-in-avatar-editor-button' href='/#' className='btn-fixed-width-lg btn-control-md'>
        <span className='icon-nav-charactercustomizer' />
      </a>
    );
  }

  if (assetCategoryType === assetCategory.Catalog && !isInPhone) {
    return (
      <a id='edit-avatar-button' href='/my/avatar' className='btn-control-md'>
        <span className='icon-nav-charactercustomizer' />
      </a>
    );
  }

  return (
    <a id='inventory-button' href={inventoryUrl} className='btn-fixed-width-lg btn-control-md'>
      {translate(resources.inventoryAction)}
    </a>
  );
}

export default function OwnedItemButtonWithTranslations({ translate, ...props }: OwnedItemButtonProps) {
  return (
    <SelfProvidedTranslate
      translate={translate}
      namespaces={itemNamespaces}
      useTranslate={useItemTranslate}
      render={t => <OwnedItemButton {...props} translate={t} />}
    />
  );
}
