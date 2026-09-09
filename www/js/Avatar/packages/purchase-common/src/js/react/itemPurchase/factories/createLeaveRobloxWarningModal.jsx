import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from '@rbx/core-scripts/react';
import { paymentFlowAnalyticsService } from '@rbx/core-scripts/legacy/core-roblox-utilities';
import translationConfig from '../translation.config';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import FoundationPurchaseModal from '../components/FoundationPurchaseModal';

const { resources } = itemPurchaseConstants;

export default function createLeaveRobloxWarningModal() {
  function LeaveRobloxWarningModal({ translate, open, onContinueToPayment, onClose }) {
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
          onContinueToPayment();
        }}
        onNeutral={onClose}
        actionButtonShow
      />
    );
  }
  LeaveRobloxWarningModal.defaultProps = {
    open: false,
    onContinueToPayment: null,
    onClose: null
  };
  LeaveRobloxWarningModal.propTypes = {
    translate: PropTypes.func.isRequired,
    open: PropTypes.bool,
    onContinueToPayment: PropTypes.func,
    onClose: PropTypes.func
  };
  return withTranslations(LeaveRobloxWarningModal, translationConfig.purchasingResources);
}
