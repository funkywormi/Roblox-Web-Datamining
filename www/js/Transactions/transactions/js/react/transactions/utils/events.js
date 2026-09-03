import { EventStream } from 'Roblox';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import transactionsEventContext from '../constants/contextConstants';

export function sendTransactionTypeClickEvent(selectValue) {
  if (EventStream) {
    EventStream.SendEventWithTarget(
      'TransactionTypeSelection',
      transactionsEventContext,
      { type: selectValue },
      EventStream.TargetTypes.WWW
    );
  }
}

export function sendTimeFrameClickEvent(selectValue) {
  if (EventStream) {
    EventStream.SendEventWithTarget(
      'TimeFrameSelection',
      transactionsEventContext,
      { type: selectValue },
      EventStream.TargetTypes.WWW
    );
  }
}

export function sendRobuxPageClickEvent() {
  if (EventStream) {
    EventStream.SendEventWithTarget(
      'RobuxPageClick',
      transactionsEventContext,
      { pg: 'Robux' },
      EventStream.TargetTypes.WWW
    );
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.TRANSACTION_PAGE,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX
    );
  }
}
