import { Subscription } from '../../../core/types/serviceTypes';

export enum GameSubscriptionActionTypes {
  LOAD_SUBSCRIPTIONS = 'LOAD_SUBSCRIPTIONS',
  OPEN_STRIPE_MODAL = 'OPEN_STRIPE_MODAL',
  CLOSE_STRIPE_MODAL = 'CLOSE_STRIPE_MODAL',
  SEND_STORE_PAGE_LOAD_EVENT = 'SEND_STORE_PAGE_LOAD_EVENT',
  MARK_SUBSCRIBED = 'MARK_SUBSCRIBED'
}

type ActionLoadSubscriptions = {
  type: GameSubscriptionActionTypes.LOAD_SUBSCRIPTIONS;
  subscriptions: Subscription[];
};

type ActionOpenStripeModal = {
  type: GameSubscriptionActionTypes.OPEN_STRIPE_MODAL;
  clientSecret: string;
  subscription: Subscription;
};

type ActionCloseStripeModal = {
  type: GameSubscriptionActionTypes.CLOSE_STRIPE_MODAL;
};

type ActionSendImpressionEvent = {
  type: GameSubscriptionActionTypes.SEND_STORE_PAGE_LOAD_EVENT;
};

type ActionMarkSubscribed = {
  type: GameSubscriptionActionTypes.MARK_SUBSCRIBED;
  subscriptionTargetKey: string;
};

type Action =
  | ActionLoadSubscriptions
  | ActionOpenStripeModal
  | ActionCloseStripeModal
  | ActionSendImpressionEvent
  | ActionMarkSubscribed;

export default Action;
