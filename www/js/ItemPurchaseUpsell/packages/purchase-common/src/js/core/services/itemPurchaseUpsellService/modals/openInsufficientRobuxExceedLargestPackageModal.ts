import React from 'react';
import { escapeHtml } from '@rbx/core-scripts/format/string';
import { deviceMeta } from '@rbx/core-scripts/legacy/header-scripts';
import { Dialog, RobloxTranslationResource, Endpoints } from '@rbx/legacy-webapp-types/Roblox';
import { paymentFlowAnalyticsService } from '@rbx/core-scripts/legacy/core-roblox-utilities';
import { ItemDetailElementDataset } from '../constants/serviceTypeDefinitions';
import formattingRobux from '../utils/common/formattingRobux';
import { GAMES_PAGE_PREFIX, LANG_KEYS, UPSELL_COUNTER_NAMES } from '../constants/upsellConstants';
import reportCounter from '../utils/common/reportCounter';
import { redirectToRobuxStore } from '../utils/common/redirectionHelpers';
import getGamePassThumbnailUrl from '../utils/common/getGamePassThumbnailUrl';
import openUnifiedRobuxUpsellModal from './openUnifiedRobuxUpsellModal';
import ItemPreviewThumbnail from '../../../../../ts/react/components/ItemPreviewThumbnail';

export default function openInsufficientRobuxExceedLargestPackageModal(
  robuxShortfallPrice: number,
  defaultThumbnailUrl: string,
  itemDetail: ItemDetailElementDataset,
  translationResource: RobloxTranslationResource,
  shouldShowUnifiedPurchaseModal = false,
  thumbnail?: React.ReactNode
): void {
  const robuxNeeded = formattingRobux(robuxShortfallPrice);
  const expectedPrice = parseInt(itemDetail.expectedPrice, 10);
  const robuxItemPrice = formattingRobux(expectedPrice);
  let itemPath = window.location.pathname;
  if (Endpoints?.supportLocalizedUrls) {
    itemPath = Endpoints.removeUrlLocale(itemPath);
  }
  let thumbnailImageUrl = defaultThumbnailUrl;
  if (itemPath.startsWith(GAMES_PAGE_PREFIX)) {
    thumbnailImageUrl = getGamePassThumbnailUrl(itemDetail) ?? thumbnailImageUrl;
  }

  const avatarPreview = `<div class='item-card-container item-preview'>
        <div class='item-card-thumb'>
          <img alt='item preview' src='${thumbnailImageUrl}' />
        </div>
        <div class='item-info text-name'>
        <div class='text-overflow item-card-name'>${escapeHtml(itemDetail.itemName)}</div>
          <div class='text-robux item-card-price'>${robuxItemPrice}</div>
        </div>
      </div>`;
  const dialogBody =
    avatarPreview +
    translationResource.get(LANG_KEYS.insufficientRobuxExceedLargestPackageMessage, {
      divTagStart: "<div class='modal-message-block text-center border-top'>",
      divTagEnd: '</div>',
      robuxNeeded
    });

  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
    true,
    paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL_EXCEED_LARGEST_PACKAGE,
    paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN
  );
  reportCounter(UPSELL_COUNTER_NAMES.UpsellExceedLargestShown, itemDetail.assetType);

  function onAccept() {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL_EXCEED_LARGEST_PACKAGE,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.GO_TO_ROBUX_STORE
    );
    reportCounter(
      UPSELL_COUNTER_NAMES.UpsellExceedLargestGoToRobuxStoreClicked,
      itemDetail?.assetType
    );
    redirectToRobuxStore(
      deviceMeta.getDeviceMeta()?.isTablet ?? false,
      deviceMeta.getDeviceMeta()?.isUniversalApp ?? false
    );
    return false;
  }

  function onCancel() {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL_EXCEED_LARGEST_PACKAGE,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL
    );
    reportCounter(UPSELL_COUNTER_NAMES.UpsellCancelled, itemDetail?.assetType);
  }
  if (shouldShowUnifiedPurchaseModal) {
    const isPrivateServer = itemDetail.isPrivateServer === true;
    const thumbnailNode =
      isPrivateServer && thumbnail
        ? thumbnail
        : ItemPreviewThumbnail({ thumbnailImageUrl: thumbnailImageUrl ?? '' });
    openUnifiedRobuxUpsellModal({
      variant: 'tooExpensive',
      expectedPrice,
      assetName: itemDetail.itemName,
      thumbnail: thumbnailNode,
      onAccept,
      onCancel
    });
    return;
  }
  Dialog.open({
    titleText: translationResource.get(LANG_KEYS.insufficientRobuxHeading, {}),
    bodyContent: dialogBody,
    declineText: translationResource.get(LANG_KEYS.cancelAction, {}),
    acceptText: translationResource.get(LANG_KEYS.goToRobuxStoreAction, {}),
    acceptColor: 'btn-primary-md',
    onAccept,
    onDecline: () => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL_EXCEED_LARGEST_PACKAGE,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL
      );
      reportCounter(UPSELL_COUNTER_NAMES.UpsellExceedLargestCancelled, itemDetail?.assetType);
    },
    onCancel,
    allowHtmlContentInBody: true,
    allowHtmlContentInFooter: false,
    fieldValidationRequired: true,
    dismissable: true,
    xToCancel: true
  });
}
