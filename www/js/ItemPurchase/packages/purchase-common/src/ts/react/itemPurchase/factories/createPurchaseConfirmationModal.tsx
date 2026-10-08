import React from 'react';
import { renderToString } from 'react-dom/server';
import { escapeHtml } from '@rbx/core-scripts/format/string';
import UnifiedPurchaseCompletionModal from '../../components/UnifiedPurchaseCompletionModal';
import urlConstants from '../constants/urlConstants';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import PriceLabel from '../components/PriceLabel';
import AssetName from '../components/AssetName';
import BalanceAfterSaleText from '../components/BalanceAfterSaleText';
import TransactionVerb from '../../enums/TransactionVerb';
import FoundationPurchaseModal from '../components/FoundationPurchaseModal';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from '../useTranslate';
import type { ModalService } from '../types/modal';

const { getAvatarPageUrl } = urlConstants;
const { resources } = itemPurchaseConstants;

export interface CustomPurchaseConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  itemName: string;
}

interface PurchaseConfirmationModalProps {
  translate?: PurchaseTranslate;
  transactionVerb?: string;
  expectedPrice: number;
  thumbnail: React.ReactNode;
  assetName: string;
  assetType: string;
  assetTypeDisplayName?: string;
  assetIsWearable?: boolean;
  sellerName: string;
  isPlace?: boolean;
  isPrivateServer?: boolean;
  onAccept?: (() => void) | null;
  onDecline?: (() => void) | null;
  itemDelayed?: boolean;
  currentRobuxBalance?: number;
  shouldShowUnifiedPurchaseCompletionModal?: boolean;
}

export default function createPurchaseConfirmationModal({
  customPurchaseConfirmationModal
}: {
  customPurchaseConfirmationModal?: React.ComponentType<CustomPurchaseConfirmationModalProps>;
}): [React.ComponentType<PurchaseConfirmationModalProps>, ModalService] {
  let setOpenFn: ((open: boolean) => void) | null = null;

  const modalService = {
    open: () => { setOpenFn?.(true); },
    close: () => { setOpenFn?.(false); }
  };

  function PurchaseConfirmationModalInner({
    translate,
    expectedPrice,
    thumbnail,
    assetName,
    assetType,
    assetIsWearable = false,
    assetTypeDisplayName = '',
    sellerName,
    isPlace = false,
    isPrivateServer = false,
    onAccept = null,
    onDecline = null,
    transactionVerb = '',
    itemDelayed = false,
    currentRobuxBalance,
    shouldShowUnifiedPurchaseCompletionModal = false
  }: PurchaseConfirmationModalProps & { translate: PurchaseTranslate }) {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
      setOpenFn = setOpen;
      return () => {
        if (setOpenFn === setOpen) setOpenFn = null;
      };
    }, []);

    let actionButtonText;
    let onAction;
    let neutralButtonText = translate(resources.continueAction);
    if (isPrivateServer) {
      actionButtonText = translate(resources.configureAction);
      neutralButtonText = translate(resources.notNowAction);
    } else if (itemDelayed) {
      actionButtonText = translate(resources.customizeAction);
      neutralButtonText = translate(resources.doneAction);
    } else if (assetIsWearable) {
      actionButtonText = translate(resources.customizeAction);
      neutralButtonText = translate(resources.notNowAction);
      onAction = () => {
        window.location.href = getAvatarPageUrl();
        return false;
      };
    }

    const assetInfo = {
      assetName: renderToString(<AssetName name={assetName} />),
      assetType: assetTypeDisplayName || assetType,
      seller: escapeHtml(sellerName),
      robux: renderToString(<PriceLabel {...{ price: expectedPrice }} />)
    };
    let messagePromptResource;
    if (transactionVerb === TransactionVerb.Bought) {
      messagePromptResource = isPlace
        ? resources.successfullyAcquiredAccessMessage
        : resources.successfullyBoughtMessage;
    } else if (transactionVerb === TransactionVerb.Renewed) {
      messagePromptResource = isPlace
        ? resources.successfullyRenewedAccessMessage
        : resources.successfullyRenewedMessage;
    } else {
      messagePromptResource = isPlace
        ? resources.successfullyAcquiredAccessMessage
        : resources.successfullyAcquiredMessage;
    }
    const body = (
      <div
        className='modal-message'
        dangerouslySetInnerHTML={{
          __html: `${translate(messagePromptResource, assetInfo)} ${
            itemDelayed ? translate(resources.itemGrantDelayMessage) : ''
          }`
        }}
      />
    );

    if (customPurchaseConfirmationModal) {
      return React.createElement(customPurchaseConfirmationModal, {
        open,
        onClose: () => {
          setOpen(false);
          if (onDecline) {
            onDecline();
          } else {
            window.location.reload();
          }
        },
        itemName: assetName
      });
    }

    if (shouldShowUnifiedPurchaseCompletionModal && !isPrivateServer) {
      return (
        <UnifiedPurchaseCompletionModal
          open={open}
          onClose={() => {
            setOpen(false);
            if (onDecline) {
              onDecline();
            } else {
              window.location.reload();
            }
          }}
          itemName={assetName}
          currentRobuxBalance={
            currentRobuxBalance === undefined ? undefined : currentRobuxBalance - expectedPrice
          }
        />
      );
    }

    return (
      <FoundationPurchaseModal
        open={open}
        title={translate(resources.purchaseCompleteHeading)}
        body={body}
        thumbnail={thumbnail}
        neutralButtonText={neutralButtonText}
        actionButtonText={actionButtonText}
        onAction={onAccept || onAction}
        onNeutral={() => {
          setOpen(false);
          onDecline?.();
        }}
        footerText={!isPrivateServer && (
          <BalanceAfterSaleText
            expectedPrice={expectedPrice}
            currentRobuxBalance={currentRobuxBalance}
          />
        )}
        actionButtonShow={!!actionButtonText}
        disableActionButton={itemDelayed}
      />
    );
  }


  function PurchaseConfirmationModal({ translate, ...props }: PurchaseConfirmationModalProps) {
    return (
      <SelfProvidedTranslate
        translate={translate}
        namespaces={purchasingNamespaces}
        useTranslate={usePurchasingTranslate}
        render={t => <PurchaseConfirmationModalInner {...props} translate={t} />}
      />
    );
  }

  return [PurchaseConfirmationModal, modalService];
}
