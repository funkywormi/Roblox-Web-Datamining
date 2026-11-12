import { paymentFlowAnalyticsService } from '@rbx/payments/payments-flow-analytics';
import type { ItemDetailElementDataset, UpsellTranslationProvider } from '../../constants/serviceTypeDefinitions';
import { UPSELL_COUNTER_NAMES } from '../../constants/upsellConstants';
import openPurchaseWarningModal from '../../modals/openPurchaseWarningModal';
import reportCounter from '../common/reportCounter';
import openLeaveRobloxWarningModal from '../../modals/openLeaveRobloxWarningModal';

function sendUserPurchaseFlowEvent(viewMessage: string) {
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent({
    triggerContext: paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
    isMidPurchaseStep: true,
    viewName: paymentFlowAnalyticsService.ENUM_VIEW_NAME.PURCHASE_WARNING,
    purchaseEventType: paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
    viewMessage
  });
}

export default async function leaveRobloxToPurchaseWarning(
  onContinueToPayment: () => void,
  intlProvider: UpsellTranslationProvider,
  itemPurchaseObj?: ItemDetailElementDataset
) {
  try {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent({
      triggerContext: paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
      isMidPurchaseStep: true,
      viewName: paymentFlowAnalyticsService.ENUM_VIEW_NAME.LEAVE_ROBLOX_WARNING,
      purchaseEventType: paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      viewMessage: paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.EXTERNAL_LINK_MODAL
    });

    reportCounter(UPSELL_COUNTER_NAMES.ContinueBuyRobuxOnExternalSite, itemPurchaseObj?.assetType);
    openLeaveRobloxWarningModal(onContinueToPayment, intlProvider, itemPurchaseObj);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}
