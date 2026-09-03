import { createContext } from 'react';
import { uuidService } from 'core-utilities';
import { Endpoints } from 'Roblox';
import { Subscription } from '../../../core/types/serviceTypes';
import Action, { GameSubscriptionActionTypes } from './GameSubscriptionActions';
import trackerClient, { SubscriptionPurchaseEventType, SubscriptionViewName } from './logging';

const getPathName = (): string => {
  let originalPath = window.location.pathname;
  if (Endpoints?.supportLocalizedUrls) {
    originalPath = Endpoints.removeUrlLocale(originalPath);
  }

  const pathName = originalPath.substring(1);
  if (pathName.startsWith('games/store-section')) {
    return pathName;
  }

  return `${pathName}#!/store`;
};

export interface GameSubscriptionsState {
  subscriptions: Subscription[];
  impressionsSent: boolean;
  stripeClientSecret: string;
  showStripeModal: boolean;
  purchaseFlowUuid: string;
  selectedSubscription: Subscription | null;
  pathName: string;
}

export const initialState: GameSubscriptionsState = {
  subscriptions: [],
  impressionsSent: false,
  stripeClientSecret: '',
  showStripeModal: false,
  purchaseFlowUuid: uuidService.generateRandomUuid(),
  selectedSubscription: null,
  pathName: getPathName()
};

function sendImpressionEvents(state: GameSubscriptionsState) {
  state.subscriptions.forEach(currentSub => {
    trackerClient.sendExperienceSubscriptionEvent(
      state.purchaseFlowUuid,
      SubscriptionPurchaseEventType.IMPRESSION,
      SubscriptionViewName.GAME_DETAILS,
      currentSub
    );
  });
}

export function gameSubscriptionsReducer(
  state: GameSubscriptionsState,
  action: Action
): GameSubscriptionsState {
  switch (action.type) {
    case GameSubscriptionActionTypes.LOAD_SUBSCRIPTIONS: {
      return {
        ...state,
        subscriptions: action.subscriptions
      };
    }
    case GameSubscriptionActionTypes.OPEN_STRIPE_MODAL:
      return {
        ...state,
        showStripeModal: true,
        stripeClientSecret: action.clientSecret,
        selectedSubscription: action.subscription
      };
    case GameSubscriptionActionTypes.CLOSE_STRIPE_MODAL:
      return {
        ...state,
        showStripeModal: false
      };
    case GameSubscriptionActionTypes.MARK_SUBSCRIBED: {
      const updatedSubscriptions = state.subscriptions.map(sub =>
        sub.subscriptionTargetKey === action.subscriptionTargetKey
          ? { ...sub, isForSale: false }
          : sub
      );
      return { ...state, subscriptions: updatedSubscriptions };
    }
    case GameSubscriptionActionTypes.SEND_STORE_PAGE_LOAD_EVENT: {
      if (!state.impressionsSent) {
        sendImpressionEvents(state);
        return { ...state, impressionsSent: true };
      }

      return state;
    }
    default:
      return state;
  }
}

export interface GameSubscriptionsContextValues {
  state: GameSubscriptionsState;
  dispatch: React.Dispatch<Action>;
}

const gameSubscriptionsContext = createContext<GameSubscriptionsContextValues | null>(null);

export default gameSubscriptionsContext;
