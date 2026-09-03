import { EnvironmentUrls } from 'Roblox';
import { fireEvent } from 'roblox-event-tracker';
import { Tracker, Configuration, TrackerRequest } from '@rbx/event-stream';
import { Subscription } from '../../../core/types/serviceTypes';

const robloxSiteDomain = EnvironmentUrls.domain;

export enum SubscriptionPurchaseEventType {
  IMPRESSION = 'Impression',
  USER_INPUT = 'UserInput',
  VIEW_SHOWN = 'ViewShown'
}

export enum SubscriptionInputType {
  SUBSCRIBE = 'Subscribe',
  OPEN_PURCHASE_MODAL = 'OpenPurchaseModal',
  CANCEL = 'Cancel',
  I_AM_A_PARENT_OR_GUARDIAN_BUTTON = 'IAmAParentOrGuardianButton',
  SAVE_NEW_PAYMENT_METHOD = 'SaveNewPaymentMethod',
  ASK_PARENT_BUTTON = 'AskParentButton'
}

export enum SubscriptionViewName {
  GAME_DETAILS = 'GameDetails',
  PURCHASE_MODAL = 'PurchaseModal',
  PARENT_PERMISSION_NEEDED_MODAL = 'ParentPermissionNeededModal',
  VPC_NEW_PAYMENT_MODAL = 'VPCNewPaymentModal',
  PURCHASE_DISABLED_PAYMENT_MODAL = 'PurchaseDisabledPaymentModal',
  DEVSUB_CARD = 'DevSubCard',
  STRIPE_CHECKOUT = 'StripeCheckout',
  CREDIT_BALANCE_CHECKOUT = 'CreditBalanceCheckout',
  ERROR = 'Error'
}

export interface SubscriptionPurchaseEvent {
  purchaseFlowUuid: string;
  purchaseFlowEventType?: string;
  viewName?: string;
  inputType?: string;
  subscriptionProviderId?: string;
  subscriptionProductTypePrefix?: string;
  subscriptionId?: string;
  localizedSubscriptionName?: string;
  localizedSubscriptionDescription?: string;
  priceInCentsUsd?: number;
  displayPrice?: string;
}

const defaultConfiguration = new Configuration({
  baseUrl: `https://ecsv2.${robloxSiteDomain}/www`
});
const tracker = new Tracker(defaultConfiguration);

export interface TrackerClient {
  sendExperienceSubscriptionEvent(
    purchaseFlowUuid: string,
    eventType: SubscriptionPurchaseEventType,
    viewName: SubscriptionViewName,
    subscription: Subscription,
    inputType?: SubscriptionInputType
  ): HTMLImageElement | null;
}

const COUNTER_EVENTS: Partial<
  Record<
    SubscriptionPurchaseEventType,
    Partial<Record<SubscriptionViewName, Partial<Record<SubscriptionInputType, string>>>>
  >
> = {
  [SubscriptionPurchaseEventType.USER_INPUT]: {
    [SubscriptionViewName.PURCHASE_MODAL]: {
      [SubscriptionInputType.SUBSCRIBE]: 'GameSubscriptionsPurchaseModalSubscribeClicked',
      [SubscriptionInputType.CANCEL]: 'GameSubscriptionsPurchaseModalCancelClicked'
    },
    [SubscriptionViewName.DEVSUB_CARD]: {
      [SubscriptionInputType.OPEN_PURCHASE_MODAL]:
        'GameSubscriptionsDevSubCardOpenPurchaseModalClicked'
    }
  }
};

const sendCounterEvent = (event: SubscriptionPurchaseEvent) => {
  if (!event.purchaseFlowEventType || !event.viewName || !event.inputType) {
    return;
  }

  const purchaseType = event.purchaseFlowEventType as SubscriptionPurchaseEventType;
  const viewName = event.viewName as SubscriptionViewName;
  const inputType = event.inputType as SubscriptionInputType;

  const counterName = COUNTER_EVENTS[purchaseType]?.[viewName]?.[inputType];
  if (counterName) {
    fireEvent(counterName);
  }
};

const trackerClient: TrackerClient = {
  sendExperienceSubscriptionEvent(
    purchaseFlowUuid: string,
    purchaseFlowEventType: SubscriptionPurchaseEventType,
    viewName: SubscriptionViewName,
    subscription: Subscription,
    inputType?: SubscriptionInputType
  ) {
    if (purchaseFlowUuid) {
      const event: SubscriptionPurchaseEvent = {
        purchaseFlowUuid,
        purchaseFlowEventType,
        viewName
      };

      if (inputType) {
        event.inputType = inputType;
      }

      event.subscriptionProviderId = subscription.subscriptionProviderId;

      const [prefix, subId] = subscription.subscriptionTargetKey.split('-');
      event.subscriptionProductTypePrefix = prefix;
      event.subscriptionId = subId;

      event.localizedSubscriptionName = subscription.name;
      event.localizedSubscriptionDescription = subscription.description;

      event.priceInCentsUsd = subscription.priceTier;
      event.displayPrice = subscription.displayPrice;

      const request: TrackerRequest = {
        target: 'www',
        localTime: new Date(),
        eventType: 'SubscriptionPurchase',
        context: '',
        additionalProperties: { ...event }
      };

      sendCounterEvent(event);
      return tracker.sendEventViaImg(request);
    }

    return null;
  }
};

export default trackerClient;
