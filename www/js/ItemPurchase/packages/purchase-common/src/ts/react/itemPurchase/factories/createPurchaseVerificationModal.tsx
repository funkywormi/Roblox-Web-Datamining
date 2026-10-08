import React from 'react';
import { renderToString } from 'react-dom/server';
import { escapeHtml } from '@rbx/core-scripts/format/string';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import PriceLabel from '../components/PriceLabel';
import AssetName from '../components/AssetName';
import BalanceAfterSaleText from '../components/BalanceAfterSaleText';
import FoundationPurchaseModal from '../components/FoundationPurchaseModal';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from '../useTranslate';
import type { ModalService } from '../types/modal';

const { resources } = itemPurchaseConstants;

interface PurchaseVerificationModalProps {
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
  onAction: () => void;
  loading?: boolean;
  currentRobuxBalance?: number;
}

export default function createPurchaseVerificationModal(): [React.ComponentType<PurchaseVerificationModalProps>, ModalService] {
  let setOpenFn: ((open: boolean) => void) | null = null;

  function PurchaseVerificationModalInner({
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
    loading = false,
    currentRobuxBalance
  }: PurchaseVerificationModalProps & { translate: PurchaseTranslate }) {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
      setOpenFn = setOpen;
      return () => { if (setOpenFn === setOpen) setOpenFn = null; };
    }, []);

    const isFiatSubscription = !!(assetType === 'Subscription' && displayPrice);

    let defaultTitle;
    let actionButtonText;
    const assetInfo = {
      assetName: renderToString(<AssetName name={assetName} />),
      assetType: assetTypeDisplayName || assetType,
      seller: escapeHtml(sellerName),
      robux: isFiatSubscription
        ? `<span class="text-robux">${escapeHtml(displayPrice)}</span>`
        : renderToString(<PriceLabel {...{ price: expectedPrice }} />)
    };
    let bodyMessageResource = isPlace
      ? resources.promptBuyAccessMessage
      : resources.promptBuyMessage;
    if (!isPlace && assetInfo.seller === '') {
      bodyMessageResource = resources.promptBuySimplifiedMessage;
    }

    if (isFiatSubscription || expectedPrice === 0) {
      defaultTitle = translate(resources.getItemHeading);
      actionButtonText = translate(resources.getNowAction);
    } else {
      defaultTitle = translate(resources.buyItemHeading);
      actionButtonText = translate(resources.buyNowAction);
    }

    if (isFiatSubscription) {
      defaultTitle = translate(resources.buyItemHeading);
      actionButtonText = translate(resources.buyNowAction);
    }

    if (isPlace) {
      actionButtonText = translate(resources.buyAccessAction);
    }

    const body = (
      <div
        className='modal-message'
        dangerouslySetInnerHTML={{
          __html: translate(bodyMessageResource, assetInfo)
        }}
      />
    );

    return (
      <FoundationPurchaseModal
        open={open}
        title={title || defaultTitle}
        body={body}
        thumbnail={thumbnail}
        neutralButtonText={translate(resources.cancelAction)}
        actionButtonText={actionButtonText}
        onAction={onAction}
        onNeutral={() => setOpen(false)}
        footerText={isFiatSubscription ? null : (
          <BalanceAfterSaleText
            expectedPrice={expectedPrice}
            currentRobuxBalance={currentRobuxBalance}
          />
        )}
        loading={loading}
        actionButtonShow
      />
    );
  }

  const modalService = {
    open: () => { setOpenFn?.(true); },
    close: () => { setOpenFn?.(false); }
  };

  function PurchaseVerificationModal({ translate, ...props }: PurchaseVerificationModalProps) {
    return (
      <SelfProvidedTranslate
        translate={translate}
        namespaces={purchasingNamespaces}
        useTranslate={usePurchasingTranslate}
        render={t => <PurchaseVerificationModalInner {...props} translate={t} />}
      />
    );
  }

  return [PurchaseVerificationModal, modalService];
}
