import React from 'react';
import { renderToString } from 'react-dom/server';
import { urlService } from '@rbx/core-scripts/legacy/core-utilities';
import { escapeHtml } from '@rbx/core-scripts/format/string';
import type { SubscriptionProductInfo } from '@rbx/client-subscriptions-api/v2';
import type { DiscountInformation } from '../../components/discountInformation';
import type { UnifiedPurchaseActionParams } from '../../components/UnifiedPurchaseModal';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import { ROBLOX_TERMS_OF_USE_URL } from '../../../core/services/itemPurchaseUpsellService/constants/upsellConstants';
import PriceLabel from '../components/PriceLabel';
import AssetName from '../components/AssetName';
import UnifiedPurchaseModal from '../../components/UnifiedPurchaseModal';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from '../useTranslate';
import type { ModalService } from '../types/modal';

const { resources } = itemPurchaseConstants;

export interface UnifiedPurchaseVerificationModalProps {
  translate?: PurchaseTranslate;
  title?: string;
  expectedPrice: number;
  displayPrice?: string;
  thumbnail: React.ReactNode;
  assetName: string;
  assetType: string;
  assetTypeDisplayName?: string;
  sellerName: string;
  isPlace?: boolean;
  onAction: (params?: UnifiedPurchaseActionParams) => void;
  onSecondaryAction?: () => void;
  primaryActionButtonText?: string;
  secondaryActionButtonText?: string;
  footerDisclaimerText?: string;
  priceSuffix?: string;
  loading?: boolean;
  currentRobuxBalance?: number;
  rentalOptionDays?: number | null;
  subscriptionProductInfo?: SubscriptionProductInfo | null;
  discountInformation?: DiscountInformation | null;
  collectibleItemId?: string | null;
  isLimited?: boolean;
}

export default function createUnifiedPurchaseVerificationModal(): [
  React.ComponentType<UnifiedPurchaseVerificationModalProps>,
  ModalService
] {
  let setOpenRef: React.Dispatch<React.SetStateAction<boolean>> | null = null;
  const modalService: ModalService = {
    open: () => {
      if (setOpenRef) {
        setOpenRef(true);
      }
    },
    close: () => {
      if (setOpenRef) {
        setOpenRef(false);
      }
    }
  };
  function UnifiedPurchaseVerificationModalInner({
    translate,
    title = '',
    expectedPrice,
    displayPrice = '',
    thumbnail,
    assetName,
    assetType,
    assetTypeDisplayName = '',
    sellerName,
    isPlace = false,
    onAction,
    onSecondaryAction,
    primaryActionButtonText = '',
    secondaryActionButtonText = '',
    footerDisclaimerText = '',
    priceSuffix,
    loading = false,
    currentRobuxBalance,
    rentalOptionDays = null,
    subscriptionProductInfo = null,
    discountInformation = null,
    collectibleItemId = null,
    isLimited = false
  }: UnifiedPurchaseVerificationModalProps & { translate: PurchaseTranslate }) {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
      setOpenRef = setOpen;
      return () => {
        if (setOpenRef === setOpen) {
          setOpenRef = null;
        }
      };
    }, []);
    let defaultTitle;
    let actionButtonText;
    const assetInfo = {
      assetName: renderToString(<AssetName name={assetName} />),
      assetType: assetTypeDisplayName || assetType,
      seller: escapeHtml(sellerName),
      robux: renderToString(
        <PriceLabel translate={translate} price={expectedPrice} color='' useFreeText={false} />
      )
    };
    let bodyMessageResource = isPlace
      ? resources.promptBuyAccessMessage
      : resources.promptBuyMessage;
    if (!isPlace && assetInfo.seller === '') {
      bodyMessageResource = resources.promptBuySimplifiedMessage;
    }

    const isFiatSubscription = !!(assetType === 'Subscription' && displayPrice);

    if (isFiatSubscription) {
      defaultTitle = translate(resources.buyItemHeading);
      actionButtonText = translate(resources.buyAction);
    } else if (expectedPrice === 0) {
      defaultTitle = translate(resources.getItemHeading);
      actionButtonText = translate(resources.getNowAction);
    } else {
      defaultTitle = translate(resources.buyItemHeading);
      actionButtonText = translate(resources.buyAction);
    }

    if (isPlace) {
      defaultTitle = translate(resources.buyExperience);
    }

    let resolvedFooterText: React.ReactNode = footerDisclaimerText || undefined;
    if (assetType === 'Subscription') {
      const locale = document.documentElement.lang || 'en-us';
      const termsUrl = urlService.getUrlWithLocale(ROBLOX_TERMS_OF_USE_URL, locale);
      const linkStartMarker = '{{LINK_START}}';
      const linkEndMarker = '{{LINK_END}}';
      const rawText = translate('Description.SubscribeTermsAgreement', {
        linkStart: linkStartMarker,
        linkEnd: linkEndMarker
      });
      const parts = rawText.split(new RegExp(`${linkStartMarker}|${linkEndMarker}`));
      resolvedFooterText = (
        <React.Fragment>
          {parts[0]}
          <a
            style={{ color: 'inherit', textDecoration: 'underline' }}
            target='_blank'
            rel='noreferrer'
            href={termsUrl}>
            {parts[1]}
          </a>
          {parts[2]}
        </React.Fragment>
      );
    }

    return (
      <UnifiedPurchaseModal
        {...{
          translate,
          titleText: title || defaultTitle,
          actionButtonText: primaryActionButtonText || actionButtonText,
          expectedPrice,
          displayPrice: isFiatSubscription ? displayPrice : undefined,
          thumbnail,
          assetName,
          assetType,
          assetTypeDisplayName,
          sellerName,
          isPlace,
          onAction,
          onSecondaryAction,
          secondaryActionButtonText: onSecondaryAction ? secondaryActionButtonText : undefined,
          footerDisclaimerText: resolvedFooterText,
          priceSuffix,
          loading,
          currentRobuxBalance,
          rentalOptionDays,
          open,
          onCancel: modalService.close,
          subscriptionProductInfo: subscriptionProductInfo ?? undefined,
          discountInformation: discountInformation ?? undefined,
          collectibleItemId: collectibleItemId ?? undefined,
          isLimited
        }}
      />
    );
  }
  function UnifiedPurchaseVerificationModal({ translate, ...props }: UnifiedPurchaseVerificationModalProps) {
    return (
      <SelfProvidedTranslate
        translate={translate}
        namespaces={purchasingNamespaces}
        useTranslate={usePurchasingTranslate}
        render={t => <UnifiedPurchaseVerificationModalInner {...props} translate={t} />}
      />
    );
  }

  return [UnifiedPurchaseVerificationModal, modalService];
}
