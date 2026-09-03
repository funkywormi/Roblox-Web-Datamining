import { urlService } from '@rbx/core-scripts/legacy/core-utilities';
import { escapeHtml } from '@rbx/core-scripts/format/string';
import {
  CurrentUser,
  Dialog,
  RobloxIntlInstance,
  RobloxTranslationResource,
  RobloxTranslationResourceProviderInstance
} from '@rbx/legacy-webapp-types/Roblox';
import { paymentFlowAnalyticsService } from '@rbx/core-scripts/legacy/core-roblox-utilities';
import {
  InsufficientFundsErrorObject,
  ItemDetailElementDataset,
  ItemDetailObject,
  ItemPurchaseAjaxDataObject,
  UpsellProduct
} from '../constants/serviceTypeDefinitions';
import formattingRobux from '../utils/common/formattingRobux';
import {
  LANG_KEYS,
  ROBLOX_TERMS_OF_USE_URL,
  UPGRADES_PAYMENT_METHODS_URL,
  UPSELL_COUNTER_NAMES
} from '../constants/upsellConstants';
import generateCookieForAutoPurchase from '../utils/startItemUpsell/generateCookieForAutoPurchase';
import checkOrStartPurchaseWarning from '../utils/startItemUpsell/checkOrStartPurchaseWarning';
import fetchAvailableUpsellProduct from '../utils/startItemUpsell/fetchAvailableUpsellProduct';
import reportCounter from '../utils/common/reportCounter';
import openUnifiedRobuxUpsellModal, {
  UnifiedRobuxUpsellModalHandle,
  UnifiedRobuxUpsellOfferActionParams
} from './openUnifiedRobuxUpsellModal';
import initiateDirectCollectiblePurchase from '../utils/autoPurchase/initiateDirectCollectiblePurchase';
import ItemPreviewThumbnail from '../../../../../ts/react/components/ItemPreviewThumbnail';

function prepareAndStartAutoPurchaseFlow(
  upsellProduct: UpsellProduct,
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  itemPurchaseObj?: ItemDetailElementDataset,
  // Discounted price + selected offers from the upsell modal. The discounted
  // price rides the existing cookie's expectedPrice field; offerIds persist in a
  // self-contained store keyed by the returned upsellUuid.
  discountedPrice?: number,
  offerIds?: string[]
) {
  const datasetForCookie =
    itemPurchaseObj && discountedPrice != null
      ? { ...itemPurchaseObj, expectedPrice: String(discountedPrice) }
      : itemPurchaseObj;
  const upsellUuid = generateCookieForAutoPurchase(
    itemPurchaseAjaxData,
    datasetForCookie,
    offerIds
  );

  reportCounter(UPSELL_COUNTER_NAMES.UpsellContinued, itemPurchaseObj?.assetType);
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
    true,
    paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
    paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
    paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.GO_TO_ROBUX_PURCHASE_PAGE
  );

  window.location.href = urlService.getAbsoluteUrl(
    `${UPGRADES_PAYMENT_METHODS_URL}?ap=${upsellProduct.roblox_product_id}&UpsellUuid=${upsellUuid}`
  );
}
function insufficientRobuxModalSendPurchaseFlowEvent(
  viewMessage: string,
  modalStartTime: number,
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  itemDetail: ItemDetailObject
) {
  const modalEndTime = Date.now();
  const elapsedTime = modalEndTime - modalStartTime;
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
    true,
    paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
    paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
    viewMessage,
    {
      userBalance: itemPurchaseAjaxData.userBalanceRobux.toString(),
      itemCost: itemDetail.expectedItemPrice.toString(),
      modalImpressionTimeInMs: elapsedTime.toString(),
      modalStartTimeInMs: modalStartTime.toString(),
      modalEndTimeInMs: modalEndTime.toString()
    }
  );
}

function autoPurchaseFlow(
  avatarPreview: string,
  errorObj: InsufficientFundsErrorObject,
  itemDetail: ItemDetailObject,
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  upsellProduct: UpsellProduct,
  intl: RobloxIntlInstance,
  translationResource: RobloxTranslationResource,
  intlProvider: RobloxTranslationResourceProviderInstance,
  shouldShowUnifiedPurchaseModal = false
) {
  const modalStartTime = Date.now();
  const termsOfUseTag = `<a class='text-link-secondary terms-of-use-link' target='_blank' href='${urlService.getUrlWithLocale(
    ROBLOX_TERMS_OF_USE_URL,
    intl.getRobloxLocale()
  )}'>`;
  const robuxNeeded = formattingRobux(errorObj.shortfallPrice, false);
  const robuxPackageAmount = formattingRobux(upsellProduct.robux_amount);
  const originalRobuxPackageAmount = upsellProduct.robux_amount_before_bonus
    ? formattingRobux(upsellProduct.robux_amount_before_bonus, false, true)
    : '';
  const dialogBodyNew =
    avatarPreview +
    translationResource.get(LANG_KEYS.insufficientRobuxMessageNew, {
      divTagStart: "<div class='modal-message-block text-center border-top'>",
      divTagEnd: '</div>',
      robuxNeeded,
      robuxPackageAmount,
      originalRobuxPackageAmount,
      sentenceSplit: '<br>',
      lineBreak: '',
      aTagStart: termsOfUseTag,
      aTagEnd: '</a>',
      divTagFooterStart:
        "<div class='modal-message-block text-center border-top modal-legal-footer'>",
      divTagFooterEnd: '</div>'
    });
  const titleText = translationResource.get(LANG_KEYS.insufficientRobuxHeadingNew, {});
  function onAccept() {
    insufficientRobuxModalSendPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX_AND_ITEM,
      modalStartTime,
      itemPurchaseAjaxData,
      itemDetail
    );
    checkOrStartPurchaseWarning(
      // no await here, so that this modal field validation will be valid, and the current modal won't disappear until the next modal show up
      upsellProduct,
      // this isUnder13 logic is only works for the web/desktop.
      // it will only show for under 13 modals, no 13-17 modal, because we have a line of text on the payment method page for them
      // but for mobile, we will should pass in true all the time. but this openNewInsufficientRobuxModal file will only be called on web
      CurrentUser.isUnder13,
      () =>
        prepareAndStartAutoPurchaseFlow(
          upsellProduct,
          itemPurchaseAjaxData,
          itemDetail.buyButtonElementDataset
        ),
      intlProvider,
      itemDetail.buyButtonElementDataset
    ).catch(() => {
      reportCounter(
        UPSELL_COUNTER_NAMES.U13PaymentModalFailedToShow,
        itemDetail.buyButtonElementDataset?.assetType
      );
      prepareAndStartAutoPurchaseFlow(
        upsellProduct,
        itemPurchaseAjaxData,
        itemDetail.buyButtonElementDataset
      ); // failed purchase warning request, but we want to continue
    });
    return false;
  }
  function onCancel() {
    insufficientRobuxModalSendPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL,
      modalStartTime,
      itemPurchaseAjaxData,
      itemDetail
    );
    reportCounter(
      UPSELL_COUNTER_NAMES.UpsellCancelled,
      itemDetail.buyButtonElementDataset?.assetType
    );
  }

  if (shouldShowUnifiedPurchaseModal) {
    const isSubscription = itemDetail.buyButtonElementDataset?.assetType === 'Subscription';
    const thumbnailNode =
      isSubscription && itemDetail.thumbnail
        ? itemDetail.thumbnail
        : ItemPreviewThumbnail({
            thumbnailImageUrl: itemPurchaseAjaxData.thumbnailImageUrl ?? ''
          });

    const collectibleItemId = itemDetail.buyButtonElementDataset?.collectibleItemId ?? null;
    const rentalOptionDays = itemDetail.buyButtonElementDataset?.rentalOptionDays ?? null;
    const userBalance = Number(itemPurchaseAjaxData.userBalanceRobux);

    // Mutable so an offer toggle that re-fetches the package against the
    // discounted shortfall redirects with the right product, and so a guard can
    // discard stale package re-fetches.
    let activeUpsellProduct: UpsellProduct = upsellProduct;
    let refetchId = 0;
    let modalHandle: UnifiedRobuxUpsellModalHandle | undefined;

    const onRefetchPackage = (discountedPrice: number) => {
      // Affordable after the discount: the modal hides the package and routes to
      // a direct purchase, so there's nothing to re-fetch.
      if (Number.isFinite(userBalance) && discountedPrice <= userBalance) {
        return;
      }
      refetchId += 1;
      const id = refetchId;
      modalHandle?.setPackageLoading(true);
      fetchAvailableUpsellProduct(itemPurchaseAjaxData, itemDetail, discountedPrice)
        .then(res => {
          if (id !== refetchId) {
            return;
          }
          if (res.status === 200 && res.data) {
            activeUpsellProduct = res.data;
            modalHandle?.updatePackage(res.data, false);
          } else {
            modalHandle?.setPackageLoading(false);
          }
        })
        .catch(() => {
          if (id === refetchId) {
            modalHandle?.setPackageLoading(false);
          }
        });
    };

    const onAcceptOffers = ({ purchasePrice, offerIds }: UnifiedRobuxUpsellOfferActionParams) => {
      insufficientRobuxModalSendPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX_AND_ITEM,
        modalStartTime,
        itemPurchaseAjaxData,
        itemDetail
      );
      const offerIdsToPersist = offerIds.length ? offerIds : undefined;
      checkOrStartPurchaseWarning(
        activeUpsellProduct,
        CurrentUser.isUnder13,
        () =>
          prepareAndStartAutoPurchaseFlow(
            activeUpsellProduct,
            itemPurchaseAjaxData,
            itemDetail.buyButtonElementDataset,
            purchasePrice,
            offerIdsToPersist
          ),
        intlProvider,
        itemDetail.buyButtonElementDataset
      ).catch(() => {
        reportCounter(
          UPSELL_COUNTER_NAMES.U13PaymentModalFailedToShow,
          itemDetail.buyButtonElementDataset?.assetType
        );
        prepareAndStartAutoPurchaseFlow(
          activeUpsellProduct,
          itemPurchaseAjaxData,
          itemDetail.buyButtonElementDataset,
          purchasePrice,
          offerIdsToPersist
        );
      });
      // Keep the modal up until the redirect / next modal appears, mirroring onAccept.
      return false;
    };

    const onDirectPurchase = ({ purchasePrice, offerIds }: UnifiedRobuxUpsellOfferActionParams) => {
      insufficientRobuxModalSendPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX_AND_ITEM,
        modalStartTime,
        itemPurchaseAjaxData,
        itemDetail
      );
      initiateDirectCollectiblePurchase({
        itemDetail,
        itemPurchaseAjaxData,
        purchasePrice,
        offerIds,
        userBalance,
        translationResource
      }).catch(() => undefined);
    };

    modalHandle = openUnifiedRobuxUpsellModal({
      variant: 'standard',
      expectedPrice: itemDetail.expectedItemPrice,
      upsellProduct,
      assetName: itemDetail.assetName,
      assetType: itemDetail.buyButtonElementDataset?.assetType || '',
      thumbnail: thumbnailNode,
      currentRobuxBalance: userBalance,
      onAccept,
      onCancel,
      intl,
      priceSuffix: isSubscription ? itemDetail.priceSuffix : undefined,
      title: isSubscription
        ? translationResource.get(LANG_KEYS.buyRobuxAndSubscriptionAction, {})
        : undefined,
      discountInformation: itemDetail.discountInformation,
      collectibleItemId,
      rentalOptionDays,
      isLimited: itemDetail.isLimited,
      onRefetchPackage,
      onAcceptOffers,
      onDirectPurchase
    });
    return;
  }
  Dialog.open({
    titleText,
    bodyContent: dialogBodyNew,
    footerText: '',
    declineText: translationResource.get(LANG_KEYS.cancelAction, {}),
    acceptText: translationResource.get(LANG_KEYS.buyRobuxAndItemAction, {}),
    acceptColor: 'btn-primary-md',
    onAccept,
    onDecline: () => {
      insufficientRobuxModalSendPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL,
        modalStartTime,
        itemPurchaseAjaxData,
        itemDetail
      );
      reportCounter(
        UPSELL_COUNTER_NAMES.UpsellCancelled,
        itemDetail.buyButtonElementDataset?.assetType
      );
    },
    onCancel,
    allowHtmlContentInBody: true,
    allowHtmlContentInFooter: false,
    fieldValidationRequired: true,
    dismissable: true,
    xToCancel: true
  });
}

export default function openNewInsufficientRobuxModal(
  errorObj: InsufficientFundsErrorObject,
  itemDetail: ItemDetailObject,
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  upsellProduct: UpsellProduct,
  intl: RobloxIntlInstance,
  translationResource: RobloxTranslationResource,
  intlProvider: RobloxTranslationResourceProviderInstance,
  shouldShowUnifiedPurchaseModal = false
): void {
  const robuxItemPrice = formattingRobux(itemDetail.expectedItemPrice);
  const avatarPreview = `<div class='item-card-container item-preview'>
        <div class='item-card-thumb'>
          <img alt='item preview' src='${itemPurchaseAjaxData.thumbnailImageUrl ?? ''}' />
        </div>
        <div class='item-info text-name'>
        <div class='text-overflow item-card-name'>${escapeHtml(itemDetail.assetName)}</div>
          <div class='text-robux item-card-price'>${robuxItemPrice}</div>
        </div>
      </div>`;
  reportCounter(UPSELL_COUNTER_NAMES.UpsellShown, itemDetail.buyButtonElementDataset?.assetType);
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
    true,
    paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
    paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN
  );

  autoPurchaseFlow(
    avatarPreview,
    errorObj,
    itemDetail,
    itemPurchaseAjaxData,
    upsellProduct,
    intl,
    translationResource,
    intlProvider,
    shouldShowUnifiedPurchaseModal
  );
}
