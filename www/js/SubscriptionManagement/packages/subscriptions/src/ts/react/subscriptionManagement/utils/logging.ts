import { EnvironmentUrls } from 'Roblox';
import { fireEvent } from 'roblox-event-tracker';
import { Tracker, Configuration, TrackerRequest } from '@rbx/event-stream';
import { UserSubscription } from '../../../core/types/userSubscription';
import { PremiumSubscription } from '../../../core/types/premiumSubscription';
import { COUNTER_METRICS, ProtoEventToCounterEventMap } from '../constants/metricConstants';

const robloxSiteDomain = EnvironmentUrls.domain;

export enum ManageEventType {
  INVALID = 'INVALID',
  PAGE_LOAD = 'PAGE_LOAD',
  VIEW_ACTIVE = 'VIEW_ACTIVE',
  VIEW_INACTIVE = 'VIEW_INACTIVE',
  CLICK_CANCEL = 'CLICK_CANCEL',
  CANCEL_SUCCESS = 'CANCEL_SUCCESS',
  EMAIL_REFERER_PAGE_LOAD = 'EMAIL_REFERER_PAGE_LOAD',
  CLICK_EDIT_PAYMENT_METHOD = 'CLICK_EDIT_PAYMENT_METHOD',
  CLICK_UPDATE_PAYMENT_METHOD = 'CLICK_UPDATE_PAYMENT_METHOD',
  UPDATE_PAYMENT_METHOD_SUCCESS = 'UPDATE_PAYMENT_METHOD_SUCCESS',
  UPDATE_PAYMENT_METHOD_EXPIRATION_SUCCESS = 'UPDATE_PAYMENT_METHOD_EXPIRATION_SUCCESS',
  UPDATE_PAYMENT_METHOD_ADD_CARD_CLICKED = 'UPDATE_PAYMENT_METHOD_ADD_CARD_CLICKED',
  UPDATE_PAYMENT_METHOD_ADD_CARD_SUCCESS = 'UPDATE_PAYMENT_METHOD_ADD_CARD_SUCCESS',
  UPDATE_PAYMENT_METHOD_FAILURE = 'UPDATE_PAYMENT_METHOD_FAILURE',
  UPDATE_PAYMENT_METHOD_EXPIRATION_FAILURE = 'UPDATE_PAYMENT_METHOD_EXPIRATION_FAILURE',
  UPDATE_PAYMENT_METHOD_ADD_CARD_FAILURE = 'UPDATE_PAYMENT_METHOD_ADD_CARD_FAILURE',
  RESUBSCRIBE_SUCCESS = 'RESUBSCRIBE_SUCCESS',
  CLICK_RESUBSCRIBE = 'CLICK_RESUBSCRIBE'
}

// All fields except userAction are optional as they are left as default
// when userAction = ManageEventType.PAGE_LOAD
export interface SubscriptionManagementEvent {
  userAction: ManageEventType;
  subscriptionProviderId?: string;
  subscriptionProductTypePrefix?: string;
  subscriptionId?: string;
  localizedSubscriptionName?: string;
  isActive?: boolean;
}

const defaultConfiguration = new Configuration({
  baseUrl: `https://ecsv2.${robloxSiteDomain}/www`
});
const tracker = new Tracker(defaultConfiguration);

export interface TrackerClient {
  sendEvent(
    userAction: ManageEventType,
    subscription?: UserSubscription | PremiumSubscription
  ): HTMLImageElement | null;
}

function isPremiumSubscription(
  subscription: UserSubscription | PremiumSubscription
): subscription is PremiumSubscription {
  return (subscription as PremiumSubscription).subscriptionProviderName === 'Roblox';
}

const trackerClient: TrackerClient = {
  sendEvent(userAction: ManageEventType, subscription?: UserSubscription | PremiumSubscription) {
    // Subscription target keys are in format {prefix}-{product id}
    const event: SubscriptionManagementEvent = {
      userAction
    };

    if (subscription) {
      const [prefix, productId] = subscription.subscriptionTargetKey.split('-');
      if (!prefix || !productId) {
        return null;
      }

      event.subscriptionProviderId = isPremiumSubscription(subscription)
        ? 'Roblox'
        : subscription.providerId;
      event.subscriptionProductTypePrefix = prefix;
      event.subscriptionId = productId;
      event.localizedSubscriptionName = subscription.name;
      event.isActive = subscription.expiration > new Date();
    }

    const request: TrackerRequest = {
      target: 'www',
      localTime: new Date(),
      eventType: 'SubscriptionManagement',
      // Context is empty as we don't use it in the actual event. May change in the future
      context: '',
      additionalProperties: { ...event }
    };

    if (ProtoEventToCounterEventMap.has(userAction)) {
      const eventToFire = ProtoEventToCounterEventMap.get(userAction);
      if (eventToFire !== undefined) {
        fireEvent(eventToFire);
      }
    }

    return tracker.sendEventViaImg(request);
  }
};

export default trackerClient;
