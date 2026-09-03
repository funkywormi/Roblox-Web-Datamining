/* eslint-disable react/jsx-no-literals */
import React, { useMemo, useState } from 'react';
import {
  Popover,
  IconButton,
  createSystemFeedback,
  TSystemFeedbackService
} from 'react-style-guide';
import { CurrentUser, Dialog, EnvironmentUrls } from 'Roblox';
import { TranslateFunction, withTranslations, WithTranslationsProps } from 'react-utilities';
import ItemDetailsInfoService from '../services/itemDetailsInfoService';
import {
  TAssetItemDetails,
  TBundleItemDetails,
  TItemType,
  TUserItemPermissions
} from '../constants/types';
import { featureItemTranslationConfig } from '../translation.config';

type TItemDetailsContextMenuProps = {
  itemDetails: TAssetItemDetails | TBundleItemDetails;
  permissions: TUserItemPermissions;
};

type TContextMenuOption =
  | 'canDeleteFromInventory'
  | 'canConfigureItem'
  | 'canSponsorItem'
  | 'canAddToShowcase'
  | 'canRemoveFromShowcase';

type TContextMenuOptionProps = {
  itemDetails: TAssetItemDetails | TBundleItemDetails;
  option: TContextMenuOption;
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
  onShowcaseChange: (isInShowcase: boolean) => void;
};

function canDeleteFromInventory(
  itemDetails: TAssetItemDetails | TBundleItemDetails,
  permissions: TUserItemPermissions
) {
  if (permissions.isDeletableType) {
    if (itemDetails.creatorType === 'User' && itemDetails.creatorTargetId === 1) {
      return false;
    }
    if (itemDetails.owned) {
      return true;
    }
  }
  return false;
}

function genMenuOptions(
  itemDetails: TAssetItemDetails | TBundleItemDetails,
  permissions: TUserItemPermissions,
  isInShowcase: boolean
): TContextMenuOption[] {
  const options: TContextMenuOption[] = [];
  if (!CurrentUser.isAuthenticated) return options;
  if (canDeleteFromInventory(itemDetails, permissions)) {
    options.push('canDeleteFromInventory');
  }
  if (permissions.canManageItem) {
    if (permissions.canConfigureItem && permissions.canViewConfigurePage) {
      options.push('canConfigureItem');
    }
    if (permissions.canSponsorItem) {
      options.push('canSponsorItem');
    }
  }
  // An item stays on the profile after the user stops owning it (resold, deleted,
  // traded away) and the allowed-type list can change after an item was pinned,
  // so removal is gated on nothing but the item currently being on the profile,
  // or it would be stuck there. permissions.isInShowcase is the state at page
  // load, so anything removed during this visit can also be put back.
  if (isInShowcase) {
    options.push('canRemoveFromShowcase');
  } else if (permissions.isInShowcase || (permissions.isAllowedInShowcase && itemDetails.owned)) {
    options.push('canAddToShowcase');
  }
  return options;
}

let isDeletingFromInventory = false;

function handleDeleteFromInventory(
  itemId: number,
  translate: TranslateFunction,
  systemFeedbackService: TSystemFeedbackService
) {
  Dialog.open({
    titleText: translate('Label.DeleteItem'),
    bodyContent: translate('Label.DeleteFromInventoryConfirm'),
    onAccept() {
      if (isDeletingFromInventory) {
        return;
      }

      isDeletingFromInventory = true;
      ItemDetailsInfoService.postDeleteItemFromInventory(itemId)
        .then(res => {
          if (res?.status === 200) {
            systemFeedbackService.success(translate('Response.RemovedFromInventory'));
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            systemFeedbackService.warning(
              translate('Response.FailedToDeleteFromInventory'),
              undefined,
              3000
            );
          }
        })
        .catch(() => {
          systemFeedbackService.warning(
            translate('Response.FailedToDeleteFromInventory'),
            undefined,
            3000
          );
        })
        .finally(() => {
          isDeletingFromInventory = false;
        });
    },
    xToCancel: true,
    allowHtmlContentInBody: true
  });
}

function handleAddToProfile(
  itemId: number,
  itemType: TItemType,
  translate: TranslateFunction,
  systemFeedbackService: TSystemFeedbackService,
  onShowcaseChange: (isInShowcase: boolean) => void
) {
  ItemDetailsInfoService.addToProfile(itemId, itemType)
    .then(() => {
      systemFeedbackService.success(translate('Response.AddedToProfile'));
      onShowcaseChange(true);
    })
    .catch(() => {
      systemFeedbackService.warning(translate('Response.FailedToAddToProfile'), undefined, 3000);
    });
}

function handleRemoveFromProfile(
  itemId: number,
  itemType: TItemType,
  translate: TranslateFunction,
  systemFeedbackService: TSystemFeedbackService,
  onShowcaseChange: (isInShowcase: boolean) => void
) {
  ItemDetailsInfoService.removeFromProfile(itemId, itemType)
    .then(() => {
      systemFeedbackService.success(translate('Response.RemovedFromProfile'));
      onShowcaseChange(false);
    })
    .catch(() => {
      systemFeedbackService.warning(
        translate('Response.FailedToRemoveFromProfile'),
        undefined,
        3000
      );
    });
}

function handleSponsorItem(itemId: number, itemType: TItemType) {
  if (itemType === 'Asset') {
    const url = `/sponsored/catalog-assets/${itemId}/create`;
    window.location.replace(url);
  }
}

function ItemDetailsContextMenuOption({
  itemDetails,
  option,
  translate,
  systemFeedbackService,
  onShowcaseChange
}: TContextMenuOptionProps) {
  if (option === 'canConfigureItem') {
    const url = `https://create.${EnvironmentUrls.domain}/dashboard/creations/${
      itemDetails.itemType === 'Asset' ? 'catalog' : 'bundle'
    }/${itemDetails.id}/configure`;
    return (
      <li>
        <a id='configure-item' href={url}>
          {translate('Action.Configure')}
        </a>
      </li>
    );
  }
  if (option === 'canDeleteFromInventory') {
    return (
      <li>
        <button
          id='delete-item'
          type='button'
          onClick={() =>
            handleDeleteFromInventory(itemDetails.id, translate, systemFeedbackService)
          }>
          {translate('Action.Delete')}
        </button>
      </li>
    );
  }
  if (option === 'canAddToShowcase') {
    return (
      <li>
        <button
          id='add-to-profile'
          type='button'
          onClick={() =>
            handleAddToProfile(
              itemDetails.id,
              itemDetails.itemType,
              translate,
              systemFeedbackService,
              onShowcaseChange
            )
          }>
          {translate('Action.AddToProfile')}
        </button>
      </li>
    );
  }
  if (option === 'canRemoveFromShowcase') {
    return (
      <li>
        <button
          id='remove-from-profile'
          type='button'
          onClick={() =>
            handleRemoveFromProfile(
              itemDetails.id,
              itemDetails.itemType,
              translate,
              systemFeedbackService,
              onShowcaseChange
            )
          }>
          {translate('Action.RemoveFromProfile')}
        </button>
      </li>
    );
  }
  if (option === 'canSponsorItem') {
    return (
      <li>
        <button
          id='sponsor-item'
          type='button'
          onClick={() => handleSponsorItem(itemDetails.id, itemDetails.itemType)}>
          {translate('Action.SponsorItem')}
        </button>
      </li>
    );
  }
  return null;
}

export const ItemDetailsContextMenu = ({
  itemDetails,
  permissions,
  translate
}: TItemDetailsContextMenuProps & WithTranslationsProps): JSX.Element | null => {
  const [isInShowcase, setIsInShowcase] = useState<boolean>(permissions.isInShowcase);

  const menuOptions = useMemo(
    () => {
      // If ctx menu was rendered by backend, return an empty array (don't render anything)
      if (document.getElementById('item-context-menu')) return [];
      return genMenuOptions(itemDetails, permissions, isInShowcase);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemDetails?.id, itemDetails?.owned, isInShowcase]
  );

  const [SystemFeedback, systemFeedbackService] = useMemo(() => createSystemFeedback(), []);

  if (!menuOptions?.length) {
    return <React.Fragment />;
  }

  return (
    <div className='item-context-menu my-ctx-menu'>
      <SystemFeedback />
      <Popover
        key={menuOptions.join(',')}
        id='game-instance-dropdown-menu'
        button={
          <IconButton
            iconName='more'
            size={IconButton.sizes.small}
            onClick={() => {
              /* function is required by typescript, but is added dynamically by the Popover parent */
            }}
          />
        }
        trigger='click'
        placement='bottom'>
        <ul className='dropdown-menu' role='menu'>
          {menuOptions.map(option => (
            <ItemDetailsContextMenuOption
              key={option}
              itemDetails={itemDetails}
              option={option}
              translate={translate}
              systemFeedbackService={systemFeedbackService}
              onShowcaseChange={setIsInShowcase}
            />
          ))}
        </ul>
      </Popover>
    </div>
  );
};
export default withTranslations(ItemDetailsContextMenu, featureItemTranslationConfig);
