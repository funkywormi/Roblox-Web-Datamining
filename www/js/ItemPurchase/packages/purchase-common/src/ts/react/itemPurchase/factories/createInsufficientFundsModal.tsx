import React from 'react';
import { renderToString } from 'react-dom/server';
import { paymentFlowAnalyticsService } from '@rbx/payments/payments-flow-analytics';
import { assetUrl } from '@rbx/www-common/asset';
import moneyStack from '../../../../images/moneystack.png';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import urlConstants from '../constants/urlConstants';
import PriceLabel from '../components/PriceLabel';
import FoundationPurchaseModal from '../components/FoundationPurchaseModal';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from '../useTranslate';
import type { ModalService } from '../types/modal';

const { resources } = itemPurchaseConstants;

interface InsufficientFundsModalProps {
  translate?: PurchaseTranslate;
  robuxNeeded: number;
  source?: string;
  onAccept?: (() => void) | null;
  open?: boolean;
  onClose?: (() => void) | null;
}

function InsufficientFundsModalInner({
  translate,
  robuxNeeded,
  source = '',
  onAccept = null,
  open = false,
  onClose = null
}: InsufficientFundsModalProps & { translate: PurchaseTranslate }) {
  let body = (
    <div
      className='text-body-large'
      dangerouslySetInnerHTML={{
        __html: translate(resources.insufficientFundsMessage, {
          robux: renderToString(<PriceLabel translate={translate} price={robuxNeeded} />)
        })
      }}
    />
  );
  if (!robuxNeeded) {
    body = <div> {translate(resources.additionalRobuxNeeded)}</div>;
  }
  return (
    <FoundationPurchaseModal
      open={open}
      title={translate(resources.insufficientFundsHeading)}
      thumbnail={
        <img
          className='width-[284px] height-[183px]'
          src={assetUrl(moneyStack)}
          alt=''
          aria-hidden='true'
        />
      }
      body={body}
      neutralButtonText={translate(resources.cancelAction)}
      actionButtonText={translate(resources.buyRobuxAction)}
      onAction={() => {
        paymentFlowAnalyticsService.sendUserPurchaseFlowEvent({
          triggerContext: paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
          isMidPurchaseStep: true,
          viewName: paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
          purchaseEventType: paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
          viewMessage: paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX
        });
        if (onAccept) {
          onAccept();
        } else {
          window.location.href = urlConstants.getRobuxUpgradesUrl(source);
        }
      }}
      onNeutral={() => {
        paymentFlowAnalyticsService.sendUserPurchaseFlowEvent({
          triggerContext: paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
          isMidPurchaseStep: true,
          viewName: paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
          purchaseEventType: paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
          viewMessage: paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL
        });
        onClose?.();
      }}
      actionButtonShow
    />
  );
}

function TranslatedModal({ translate, ...props }: InsufficientFundsModalProps) {
  return (
    <SelfProvidedTranslate
      translate={translate}
      namespaces={purchasingNamespaces}
      useTranslate={usePurchasingTranslate}
      render={t => <InsufficientFundsModalInner {...props} translate={t} />}
    />
  );
}

export default function createInsufficientFundsModal(): [React.ComponentType<Omit<InsufficientFundsModalProps, 'translate'>>, ModalService] {
  let setOpenFn: React.Dispatch<React.SetStateAction<boolean>> | null = null;

  function ImperativeWrapper(props: Omit<InsufficientFundsModalProps, 'translate'>) {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
      setOpenFn = setOpen;
      return () => { if (setOpenFn === setOpen) setOpenFn = null; };
    }, []);
    return <TranslatedModal {...(props as InsufficientFundsModalProps)} open={open} onClose={() => setOpen(false)} />;
  }

  const modalService: ModalService = {
    open: () => { setOpenFn?.(true); },
    close: () => { setOpenFn?.(false); }
  };

  return [ImperativeWrapper, modalService];
}

export const InsufficientFundsModal = TranslatedModal;
