import { document, window } from "@rbx/core-lib/browser";
import { PURCHASE_EVENT_TYPE, TRIGGERING_CONTEXT, VIEW_MESSAGE, VIEW_NAME } from "./constants";
import type { PaymentFlowAnalytics } from "./types";

/**
 * `@rbx/core-scripts/payments-flow` binds these same buttons. The first library
 * to run owns the listeners so one click does not send two events. Remove this
 * once callers no longer load both libraries.
 */
const LISTENERS_ATTACHED_KEY = "__rbxPaymentsFlowListenersAttached";

const BUY_ROBUX_MENU_BUTTON_SELECTOR = "#header li a.robux-menu-btn";
const REACT_BUY_BUTTON_CONTAINER_ELEMENT_ID = "display-price-container";
const GET_PREMIUM_BUTTON_ON_ITEM_DETAIL_SELECTOR = "#item-details #upgrade-button";
const PREMIUM_PROMPT_BUTTON_ON_ITEM_DETAIL_SELECTOR = "#item-details .premium-prompt a";

const clickLabel = (event: Event): string => {
  const { currentTarget } = event;
  if (
    currentTarget != null &&
    "innerText" in currentTarget &&
    typeof currentTarget.innerText === "string"
  ) {
    return currentTarget.innerText;
  }
  return "";
};

const setupBuyRobuxMenuBtn = (analytics: PaymentFlowAnalytics): void => {
  document?.querySelector(BUY_ROBUX_MENU_BUTTON_SELECTOR)?.addEventListener("click", event => {
    analytics.sendUserPurchaseFlowEvent({
      triggerContext: TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      isMidPurchaseStep: false,
      viewName: VIEW_NAME.NAVIGATION_MENU,
      purchaseEventType: PURCHASE_EVENT_TYPE.USER_INPUT,
      viewMessage: clickLabel(event),
    });
  });
};

const isCsHtmlBuyButtonLoaded = (): boolean =>
  document?.getElementById(REACT_BUY_BUTTON_CONTAINER_ELEMENT_ID) == null;

const setupPremiumUpsellBtnOnItemDetailPage = (analytics: PaymentFlowAnalytics): void => {
  document
    ?.querySelector(GET_PREMIUM_BUTTON_ON_ITEM_DETAIL_SELECTOR)
    ?.addEventListener("click", () => {
      analytics.sendUserPurchaseFlowEvent({
        triggerContext: TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
        isMidPurchaseStep: false,
        viewName: VIEW_NAME.PREMIUM_UPSELL,
        purchaseEventType: PURCHASE_EVENT_TYPE.USER_INPUT,
        viewMessage: VIEW_MESSAGE.GET_PREMIUM,
      });
    });
  document
    ?.querySelector(PREMIUM_PROMPT_BUTTON_ON_ITEM_DETAIL_SELECTOR)
    ?.addEventListener("click", event => {
      analytics.sendUserPurchaseFlowEvent({
        triggerContext: TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
        isMidPurchaseStep: false,
        viewName: VIEW_NAME.PREMIUM_UPSELL,
        purchaseEventType: PURCHASE_EVENT_TYPE.USER_INPUT,
        viewMessage: clickLabel(event),
      });
    });
};

const claimExternalEventListeners = (): boolean => {
  // Typed as `object` because some dependencies add a string index signature to `Window`.
  const currentWindow: object | undefined = window;
  if (currentWindow == null) {
    return true;
  }
  const attached: unknown = Reflect.get(currentWindow, LISTENERS_ATTACHED_KEY);
  if (attached === true) {
    return false;
  }
  Object.assign(currentWindow, { [LISTENERS_ATTACHED_KEY]: true });
  return true;
};

export const setupExternalEventListeners = (analytics: PaymentFlowAnalytics): void => {
  const currentDocument = document;
  if (currentDocument == null || !claimExternalEventListeners()) {
    return;
  }

  const setup = (): void => {
    setupBuyRobuxMenuBtn(analytics);
    if (isCsHtmlBuyButtonLoaded()) {
      setupPremiumUpsellBtnOnItemDetailPage(analytics);
    }
  };

  if (currentDocument.readyState === "loading") {
    currentDocument.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
};
