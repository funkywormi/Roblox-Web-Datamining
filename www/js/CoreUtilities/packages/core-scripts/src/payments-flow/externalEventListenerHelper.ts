// TODO: old, migrated code
// eslint-disable-next-line import-x/no-cycle
import { PaymentFlowAnalyticsService } from "./index";

/**
 * `@rbx/payments/payments-flow-analytics` binds these same buttons. The first
 * library to run owns the listeners so one click does not send two events.
 * Remove this once callers no longer load both libraries.
 */
const LISTENERS_ATTACHED_KEY = "__rbxPaymentsFlowListenersAttached";

const BUY_ROBUX_MENU_BUTTON_SELECTOR = "#header li a.robux-menu-btn";
const REACT_BUY_BUTTON_CONTAINER_ELEMENT_ID = "display-price-container";
const GET_PREMIUM_BUTTON_ON_ITEM_DETAIL_SELECTOR = "#item-details #upgrade-button";
const PREMIUM_PROMPT_BUTTON_ON_ITEM_DETAIL_SELECTOR = "#item-details .premium-prompt a";

const setupBuyRobuxMenuBtn = (paymentFlowAnalyticsService: PaymentFlowAnalyticsService) => {
  document.querySelector(BUY_ROBUX_MENU_BUTTON_SELECTOR)?.addEventListener("click", event => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.NAVIGATION_MENU,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (event.target as any).innerText as string,
    );
  });
};

/**
 * Check if the Get Premium button is from cshtml or from react app
 */
const isCsHtmlBuyButtonLoaded = () =>
  !document.getElementById(REACT_BUY_BUTTON_CONTAINER_ELEMENT_ID);

const setupPremiumUpsellBtnOnItemDetailPage = (
  paymentFlowAnalyticsService: PaymentFlowAnalyticsService,
) => {
  // This is the "Get Premium" upsell button from the item detail cshtml
  document
    .querySelector(GET_PREMIUM_BUTTON_ON_ITEM_DETAIL_SELECTOR)
    ?.addEventListener("click", () => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
        false,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.PREMIUM_UPSELL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.GET_PREMIUM,
      );
    });
  // This is the "Get Premium and buy for xx" upsell button from the item detail cshtml
  document
    .querySelector(PREMIUM_PROMPT_BUTTON_ON_ITEM_DETAIL_SELECTOR)
    ?.addEventListener("click", event => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
        false,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.PREMIUM_UPSELL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        (event.target as any).innerText as string,
      );
    });
};

/**
 * Setup event listeners for external div
 * Only set up here when the div is a pure html tag and you need to add an onClick to the html tag
 *
 * @param paymentFlowAnalyticsService
 */
const claimExternalEventListeners = (): boolean => {
  const currentWindow = window as Window & { __rbxPaymentsFlowListenersAttached?: boolean };
  if (currentWindow[LISTENERS_ATTACHED_KEY] === true) {
    return false;
  }
  currentWindow[LISTENERS_ATTACHED_KEY] = true;
  return true;
};

const setupExternalEventListeners = (
  paymentFlowAnalyticsService: PaymentFlowAnalyticsService,
): void => {
  if (!claimExternalEventListeners()) {
    return;
  }
  const setup = (): void => {
    setupBuyRobuxMenuBtn(paymentFlowAnalyticsService);
    if (isCsHtmlBuyButtonLoaded()) {
      setupPremiumUpsellBtnOnItemDetailPage(paymentFlowAnalyticsService);
    }
  };

  // DOMContentLoaded does not fire again if this bundle loads after the document
  // is ready. Attach immediately in that case, matching @rbx/payments.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
};

export default setupExternalEventListeners;
