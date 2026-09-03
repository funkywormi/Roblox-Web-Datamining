import React from 'react';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import { withTranslations } from '@rbx/core-scripts/react';
import { createModal } from '@rbx/core-ui/legacy/react-style-guide';
import { escapeHtml } from '@rbx/core-scripts/format/string';
import UnifiedPurchaseCompletionModal from '../../../../ts/react/components/UnifiedPurchaseCompletionModal';
import urlConstants from '../constants/urlConstants';
import translationConfig from '../translation.config';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import PriceLabel from '../components/PriceLabel';
import AssetName from '../components/AssetName';
import BalanceAfterSaleText from '../components/BalanceAfterSaleText';
import TransactionVerb from '../../../../ts/react/enums/TransactionVerb';

const { getAvatarPageUrl } = urlConstants;
const { resources } = itemPurchaseConstants;

export default function createPurchaseConfirmationModal({ customPurchaseConfirmationModal }) {
  const [Modal, legacyModalService] = createModal();
  let setOpenRef = null;
  const modalService = {
    open: () => {
      if (setOpenRef) {
        setOpenRef(true);
      } else {
        legacyModalService.open();
      }
    },
    close: () => {
      if (setOpenRef) {
        setOpenRef(false);
      } else {
        legacyModalService.close();
      }
    }
  };
  function PurchaseConfirmationModal({
    translate,
    expectedPrice,
    thumbnail,
    assetName,
    assetType,
    assetIsWearable,
    assetTypeDisplayName,
    sellerName,
    isPlace,
    isPrivateServer,
    onAccept,
    onDecline,
    transactionVerb,
    itemDelayed,
    currentRobuxBalance,
    shouldShowUnifiedPurchaseCompletionModal
  }) {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
      if (customPurchaseConfirmationModal || shouldShowUnifiedPurchaseCompletionModal) {
        setOpenRef = setOpen;
        return () => {
          if (setOpenRef === setOpen) {
            setOpenRef = null;
          }
        };
      }
      setOpenRef = null;
      return undefined;
    }, [shouldShowUnifiedPurchaseCompletionModal]);
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
          currentRobuxBalance={currentRobuxBalance - expectedPrice}
        />
      );
    }

    return (
      <Modal
        {...{
          title: translate(resources.purchaseCompleteHeading),
          body,
          thumbnail,
          neutralButtonText,
          actionButtonText,
          onAction: onAccept || onAction,
          onNeutral: onDecline,
          footerText: !isPrivateServer && (
            <BalanceAfterSaleText
              expectedPrice={expectedPrice}
              currentRobuxBalance={currentRobuxBalance}
            />
          ),
          actionButtonShow: !!actionButtonText,
          disableActionButton: itemDelayed,
          onClose: () => window.location.reload()
        }}
      />
    );
  }

  PurchaseConfirmationModal.defaultProps = {
    isPlace: false,
    assetTypeDisplayName: '',
    transactionVerb: '',
    assetIsWearable: false,
    isPrivateServer: false,
    onAccept: null,
    onDecline: null,
    itemDelayed: false,
    currentRobuxBalance: undefined,
    shouldShowUnifiedPurchaseCompletionModal: false
  };

  PurchaseConfirmationModal.propTypes = {
    translate: PropTypes.func.isRequired,
    transactionVerb: PropTypes.string,
    expectedPrice: PropTypes.number.isRequired,
    thumbnail: PropTypes.node.isRequired,
    assetName: PropTypes.string.isRequired,
    assetType: PropTypes.string.isRequired,
    assetTypeDisplayName: PropTypes.string,
    assetIsWearable: PropTypes.bool,
    sellerName: PropTypes.string.isRequired,
    isPlace: PropTypes.bool,
    isPrivateServer: PropTypes.bool,
    onAccept: PropTypes.func,
    onDecline: PropTypes.func,
    itemDelayed: PropTypes.bool,
    currentRobuxBalance: PropTypes.number,
    shouldShowUnifiedPurchaseCompletionModal: PropTypes.bool
  };
  return [
    withTranslations(PurchaseConfirmationModal, translationConfig.purchasingResources),
    modalService
  ];
}
