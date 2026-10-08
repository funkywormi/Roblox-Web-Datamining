import React from 'react';
import paymentFlowAnalyticsService from '@rbx/core-scripts/payments-flow';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import FoundationPurchaseModal from '../components/FoundationPurchaseModal';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from '../useTranslate';

const { resources } = itemPurchaseConstants;

interface LeaveRobloxWarningModalProps {
  translate?: PurchaseTranslate;
  open?: boolean;
  onContinueToPayment?: () => void;
  onClose?: () => void;
}

export default function createLeaveRobloxWarningModal() {
  function LeaveRobloxWarningModal({
    translate,
    open = false,
    onContinueToPayment,
    onClose
  }: LeaveRobloxWarningModalProps & { translate: PurchaseTranslate }) {
    const bodyContent =
      translate(resources.redirectToPartnerWebsiteMessage, { linebreak: '\n\n' }) ||
      'This purchase must be completed on our partner’s website. You will be returned to Roblox after the purchase is completed.\n\n Proceed to partner website for payment?';
    const body = <p className='modal-body'>{bodyContent}</p>;
    return (
      <FoundationPurchaseModal
        open={open}
        title={translate(resources.leavingRobloxHeading) || 'Leaving Roblox'}
        body={body}
        neutralButtonText={translate(resources.cancelAction)}
        actionButtonText={translate(resources.continueToPaymentAction) || 'Continue To Payment'}
        onAction={() => {
          paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
            paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
            true,
            paymentFlowAnalyticsService.ENUM_VIEW_NAME.LEAVE_ROBLOX_WARNING,
            paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
            paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CONTINUE_TO_VNG
          );
          onContinueToPayment?.();
        }}
        onNeutral={onClose}
        actionButtonShow
      />
    );
  }
  return function LeaveRobloxWarningModalWithTranslations({
    translate,
    ...props
  }: LeaveRobloxWarningModalProps) {
    return (
      <SelfProvidedTranslate
        translate={translate}
        namespaces={purchasingNamespaces}
        useTranslate={usePurchasingTranslate}
        render={t => <LeaveRobloxWarningModal {...props} translate={t} />}
      />
    );
  };
}
