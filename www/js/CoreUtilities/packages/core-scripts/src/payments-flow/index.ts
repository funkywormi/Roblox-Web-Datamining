import "../global";
import { uuidService } from "@rbx/core";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import environmentUrls from "@rbx/environment-urls";
import PaymentFlowContext from "./paymentFlowContext";
import {
  ASSET_TYPE,
  COUNTER_EVENTS,
  CUSTOM_EVENT,
  EVENT_NAME,
  PURCHASE_EVENT_TYPE,
  PURCHASE_STATUS,
  TRIGGERING_CONTEXT,
  VIEW_MESSAGE,
  VIEW_NAME,
} from "./constants";
// TODO: old, migrated code
// eslint-disable-next-line import-x/no-cycle
import setupExternalEventListeners from "./externalEventListenerHelper";
import { sendEventWithTarget, targetTypes } from "../event-stream";

// eslint-disable-next-line no-console
const fireEvent = window.EventTracker?.fireEvent ?? console.log;

export class PaymentFlowAnalyticsService {
  public purchaseFlowUuid = "";

  public triggerContext: TRIGGERING_CONTEXT | undefined = undefined;

  public readonly ENUM_TRIGGERING_CONTEXT = TRIGGERING_CONTEXT;

  public readonly ENUM_VIEW_NAME = VIEW_NAME;

  public readonly ENUM_PURCHASE_EVENT_TYPE = PURCHASE_EVENT_TYPE;

  public readonly ENUM_VIEW_MESSAGE = VIEW_MESSAGE;

  public readonly ENUM_PURCHASE_STATUS = PURCHASE_STATUS;

  public readonly ENUM_CUSTOM_EVENT = CUSTOM_EVENT;

  private eventMetadata: Record<string, string> = {};

  /**
   * Only run when there is redirection, go back/forward might not trigger the constructor if page loaded from cache
   */
  constructor() {
    this.loadOrStartPaymentFlow();
  }

  /**
   * Load the pre-existing ctx if it exists and we detect an existing session
   * If no existing session or no pre-existing ctx, then we should start a new flow
   */
  private loadOrStartPaymentFlow(): void {
    try {
      // Try to load the pre-existing ctx if it exists and we detect an existing session
      if (!this.purchaseFlowUuid) {
        this.tryLoadPreExistingCtx();
      }
      // If no existing session or no pre-existing ctx, then we should start a new flow
      if (!this.purchaseFlowUuid) {
        // No existing flow Uuid, starting a new flow
        const urlAnalyticId = PaymentFlowAnalyticsService.getUrlAnalyticId();
        this.purchaseFlowUuid = urlAnalyticId ?? uuidService.generateRandomUuid();
        this.writePaymentFlowContextIntoCookie();
      }
    } catch {
      fireEvent(COUNTER_EVENTS.START_FLOW_ERROR);
    }
  }

  /**
   * Returns the payment flow uuid
   */
  public getPaymentFlowUuid(): string {
    return this.purchaseFlowUuid;
  }

  /**
   * Allows setting the payment flow uuid
   * Also persists the uuid and trigger context to local storage / cookie
   */
  public setPaymentFlowUuid(id: string): void {
    this.purchaseFlowUuid = id;
    this.writePaymentFlowContextIntoCookie();
  }

  /**
   * Helper method for the upsell process to start a new flow
   * When item purchase upsell happens, we could use this method to start the flow to add asset type info
   *
   * @param assetType
   * @param isReseller
   * @param isPrivateServer
   * @param isPlace
   * @param itemId
   */
  public startRobuxUpsellFlow(
    // TODO: remove string from here
    assetType: ASSET_TYPE | string,
    isReseller = false,
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isPrivateServer = false,
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isPlace = false,
    itemId = "",
  ): void {
    this.eventMetadata.item_type = assetType;
    this.eventMetadata.item_id = itemId;

    if (assetType === ASSET_TYPE.GAME_PASS.valueOf()) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_GAME_PASS_ROBUX_UPSELL;
    } else if (assetType === ASSET_TYPE.DEVELOPER_PRODUCT.valueOf()) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_DEVELOPER_PRODUCT_ROBUX_UPSELL;
    } else if (assetType === ASSET_TYPE.PLACE.valueOf()) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_PAID_GAME_ROBUX_UPSELL;
    } else if (assetType === ASSET_TYPE.PRIVATE_SERVER.valueOf()) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_PRIVATE_SERVER_ROBUX_UPSELL;
    } else if (
      assetType === ASSET_TYPE.BUNDLE.valueOf() ||
      assetType === ASSET_TYPE.PACKAGE.valueOf()
    ) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_CATALOG_BUNDLE_ITEM_ROBUX_UPSELL;
    } else if (isReseller) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_CATALOG_COLLECTIVE_ITEM_ROBUX_UPSELL;
    } else {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL;
    }
    this.writePaymentFlowContextIntoCookie();
  }

  /**
   * Helper method for the Roblox Plus upsell process to start a new flow
   * using asset type info.
   *
   * @param params.assetType
   * @param params.isReseller
   * @param params.itemId
   */
  public startRobloxPlusUpsellFlow({
    assetType,
    isReseller = false,
    itemId = "",
  }: {
    // TODO: remove string from here
    assetType: ASSET_TYPE | string;
    isReseller?: boolean;
    itemId?: string;
  }): void {
    this.eventMetadata.item_type = assetType;
    this.eventMetadata.item_id = itemId;

    if (isReseller) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_CATALOG_RESALE_ITEM_PLUS_UPSELL;
    } else {
      switch (assetType) {
        case ASSET_TYPE.GAME_PASS.valueOf():
          this.triggerContext = TRIGGERING_CONTEXT.WEB_GAME_PASS_PLUS_UPSELL;
          break;
        case ASSET_TYPE.DEVELOPER_PRODUCT.valueOf():
          this.triggerContext = TRIGGERING_CONTEXT.WEB_DEVELOPER_PRODUCT_PLUS_UPSELL;
          break;
        case ASSET_TYPE.PRIVATE_SERVER.valueOf():
          this.triggerContext = TRIGGERING_CONTEXT.WEB_PRIVATE_SERVER_PLUS_UPSELL;
          break;
        case ASSET_TYPE.BUNDLE.valueOf():
        case ASSET_TYPE.PACKAGE.valueOf():
          this.triggerContext = TRIGGERING_CONTEXT.WEB_CATALOG_BUNDLE_ITEM_PLUS_UPSELL;
          break;
        case ASSET_TYPE.SUBSCRIPTION.valueOf():
          this.triggerContext = TRIGGERING_CONTEXT.WEB_DEVELOPER_SUBSCRIPTION_PLUS_UPSELL;
          break;
        default:
          this.triggerContext = TRIGGERING_CONTEXT.WEB_CATALOG_SINGLE_ITEM_PLUS_UPSELL;
          break;
      }
    }

    this.writePaymentFlowContextIntoCookie();
  }

  /**
   * Send a user purchase flow event
   * This method could used to generate a new flow, or continue the existing flow
   *
   * When user enter into 1 page, there are 2 possibilities:
   *    1. pre-existing:
   *      We will resume from the existing flow
   *    2. not pre-existing
   *      Create a new one flow
   *
   * @param triggerContext
   * @param isMidPurchaseStep
   *    MidPurchaseStep = true means there ways outside of the regular flow to reach certain steps
   *    in the purchasing flow that wouldn't have context
   *    For example: payment methods selection button, they all are MidPurchaseStep. Because, basically,
   *     all flow will go through that page on web, but user could reach that page by entering the URL.
   *     If reach by entering the URL, and no valid referrer, we will start a new flow using the triggerCtx
   *     passed in as fallback
   * @param viewName
   * @param purchaseEventType
   * @param viewMessage
   * @param eventMetadata
   * @param isTerminalView
   */
  public sendUserPurchaseFlowEvent(
    triggerContext: TRIGGERING_CONTEXT,
    isMidPurchaseStep?: boolean,
    viewName?: VIEW_NAME,
    purchaseEventType?: PURCHASE_EVENT_TYPE,
    viewMessage?: VIEW_MESSAGE | string,
    eventMetadata: Record<string, string> = {},
    isTerminalView = false,
  ): void {
    try {
      const sanitziedTriggerContext =
        PaymentFlowAnalyticsService.ReclassifyPlatformTriggeringContext({ triggerContext });
      this.eventMetadata = { ...this.eventMetadata, ...eventMetadata };
      if (!viewName && !purchaseEventType && !viewMessage) {
        fireEvent(COUNTER_EVENTS.WRONG_USAGE_OF_METHOD);
        return;
      }
      if (!this.triggerContext) {
        this.triggerContext = sanitziedTriggerContext;
        this.writePaymentFlowContextIntoCookie();
        if (isMidPurchaseStep) {
          fireEvent(COUNTER_EVENTS.MID_PURCHASE_STEP_TRIGGERED_WITHOUT_VALID_CTX);
        }
      }
      this.sendEvent(EVENT_NAME.USER_PURCHASE_FLOW, viewName, purchaseEventType, viewMessage);

      if (isTerminalView) {
        this.handleTerminalPage();
      }
    } catch {
      fireEvent(COUNTER_EVENTS.SEND_USER_EVENT_ERROR);
    }
  }

  /**
   * Send a user purchase status event
   * A status event should never be used as flow starter but a middle of purchase state indicator
   *
   * @param triggerContext
   * @param status
   * @param viewMessage
   * @param viewName
   */
  public sendUserPurchaseStatusEvent(
    triggerContext: TRIGGERING_CONTEXT,
    status?: PURCHASE_STATUS,
    viewMessage?: string,
    viewName?: VIEW_NAME,
  ): void {
    try {
      const sanitziedTriggerContext =
        PaymentFlowAnalyticsService.ReclassifyPlatformTriggeringContext({ triggerContext });
      if (!status && !viewMessage && !viewName) {
        fireEvent(COUNTER_EVENTS.WRONG_USAGE_OF_METHOD);
        return;
      }
      if (!this.triggerContext) {
        this.triggerContext = sanitziedTriggerContext;
        this.writePaymentFlowContextIntoCookie();
      }

      this.sendEvent(EVENT_NAME.USER_PURCHASE_STATUS, viewName, undefined, viewMessage, status);

      if (PaymentFlowAnalyticsService.isTerminalView(viewName)) {
        this.handleTerminalPage();
      }
    } catch {
      fireEvent(COUNTER_EVENTS.SEND_STATUS_EVENT_ERROR);
    }
  }

  private writePaymentFlowContextIntoCookie() {
    const flowCtx = new PaymentFlowContext(this.purchaseFlowUuid, this.triggerContext);
    flowCtx.save();
  }

  private sendEvent(
    eventName: EVENT_NAME,
    viewName?: VIEW_NAME,
    purchaseEventType?: PURCHASE_EVENT_TYPE,
    viewMessage?: VIEW_MESSAGE | string,
    status?: PURCHASE_STATUS,
    eventPros: Record<string, unknown> = {},
  ) {
    if (!this.purchaseFlowUuid || !this.triggerContext) {
      fireEvent(COUNTER_EVENTS.SEND_EVENT_WITHOUT_UUID_OR_CTX);
      return;
    }

    const referralUrl = (window.document.referrer || window.frames.top?.document.referrer) ?? "";
    const previousView = PaymentFlowAnalyticsService.extractView(referralUrl);
    const currentView = PaymentFlowAnalyticsService.extractView(window.location.href);
    const metadata = JSON.stringify(this.eventMetadata);

    sendEventWithTarget(
      eventName,
      this.triggerContext,
      {
        purchase_flow_uuid: this.purchaseFlowUuid,
        view_name: viewName,
        purchase_event_type: purchaseEventType,
        view_message: viewMessage,
        status,
        refurl: referralUrl.substring(0, 200), // Max 200 should be sufficient for logging urls
        prev_view_path: previousView,
        current_view_path: currentView,
        event_metadata: metadata,
        ...eventPros,
      },
      targetTypes.WWW,
    );
  }

  private tryLoadPreExistingCtx() {
    try {
      const { referrer } = document;
      const isInternalNavigation =
        referrer && new URL(referrer).hostname.endsWith(environmentUrls.domain);
      const navigation = performance.getEntriesByType("navigation")[0];
      const isBrowserNavigation =
        navigation instanceof PerformanceNavigationTiming &&
        (navigation.type === "back_forward" || navigation.type === "reload");

      // If the navigation is not internal and not a browser navigation, then we should not load the pre-existing ctx
      // We will consider browser movements and internal navigations as continuing the same session
      if (!isInternalNavigation && !isBrowserNavigation) {
        return;
      }

      // load pre-existing one from cookie
      const flowCtx = PaymentFlowContext.loadFromCookie();

      if (flowCtx) {
        if (flowCtx.purchaseFlowUuid) {
          this.purchaseFlowUuid = flowCtx.purchaseFlowUuid;
        }
        if (flowCtx.triggeringContext) {
          this.triggerContext = flowCtx.triggeringContext;
        }
      }
    } catch {
      fireEvent(COUNTER_EVENTS.LOAD_PRE_EXISTING_CTX_ERROR);
    }
  }

  private static extractView(referralUrl: string): string {
    if (!referralUrl) {
      return "";
    }

    const url = new URL(referralUrl);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!url) {
      return "";
    }
    if (url.hostname.endsWith(`.${environmentUrls.domain}`)) {
      return url.pathname;
    }

    return "External";
  }

  private handleTerminalPage() {
    if (!this.purchaseFlowUuid) {
      return;
    }

    PaymentFlowContext.stop();
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.sendUserPurchaseStatusEvent(this.triggerContext!, PURCHASE_STATUS.PAYMENT_FLOW_ENDED);
    fireEvent(COUNTER_EVENTS.FLOW_ENDED);
  }

  private static isTerminalView(viewName?: VIEW_NAME) {
    if (viewName === VIEW_NAME.CHECKOUT_SUCCESS) {
      return true;
    }

    return false;
  }

  private static getUrlAnalyticId(): string | null {
    return new URLSearchParams(window.location.search).get("analyticId");
  }

  /**
   * Due to the fact that different Apps could choose to send WEB or WEBVIEW context on their own which is hard to controlled and very inconsistent, force reclassifying the triggering context for the two Robux purchase events based on if the user is in App or not.
   *
   * @param triggerContext
   * @private
   */
  private static ReclassifyPlatformTriggeringContext({
    triggerContext,
  }: {
    triggerContext: TRIGGERING_CONTEXT;
  }): TRIGGERING_CONTEXT {
    const meta = getDeviceMeta();
    const isInApp =
      meta && (meta.isAmazonApp || meta.isUWPApp || meta.isIosApp || meta.isAndroidApp);

    switch (triggerContext) {
      case TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE:
      case TRIGGERING_CONTEXT.WEBVIEW_ROBUX_PURCHASE:
        return isInApp
          ? TRIGGERING_CONTEXT.WEBVIEW_ROBUX_PURCHASE
          : TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE;
      case TRIGGERING_CONTEXT.MOBILE_WEB_ROBUX_PURCHASE:
        return isInApp
          ? TRIGGERING_CONTEXT.WEBVIEW_ROBUX_PURCHASE
          : TRIGGERING_CONTEXT.MOBILE_WEB_ROBUX_PURCHASE;
      case TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE:
      case TRIGGERING_CONTEXT.WEBVIEW_PREMIUM_PURCHASE:
        return isInApp
          ? TRIGGERING_CONTEXT.WEBVIEW_PREMIUM_PURCHASE
          : TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE;
      case TRIGGERING_CONTEXT.MOBILE_WEB_PREMIUM_PURCHASE:
        return isInApp
          ? TRIGGERING_CONTEXT.WEBVIEW_PREMIUM_PURCHASE
          : TRIGGERING_CONTEXT.MOBILE_WEB_PREMIUM_PURCHASE;
      case TRIGGERING_CONTEXT.WEB_ROBLOX_PLUS_PURCHASE:
      case TRIGGERING_CONTEXT.WEBVIEW_ROBLOX_PLUS_PURCHASE:
        return isInApp
          ? TRIGGERING_CONTEXT.WEBVIEW_ROBLOX_PLUS_PURCHASE
          : TRIGGERING_CONTEXT.WEB_ROBLOX_PLUS_PURCHASE;
      case TRIGGERING_CONTEXT.MOBILE_WEB_ROBLOX_PLUS_PURCHASE:
        return isInApp
          ? TRIGGERING_CONTEXT.WEBVIEW_ROBLOX_PLUS_PURCHASE
          : TRIGGERING_CONTEXT.MOBILE_WEB_ROBLOX_PLUS_PURCHASE;
      case TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL:
      case TRIGGERING_CONTEXT.WEB_CATALOG_PREMIUM_UPSELL:
      case TRIGGERING_CONTEXT.WEB_CATALOG_COLLECTIVE_ITEM_ROBUX_UPSELL:
      case TRIGGERING_CONTEXT.WEB_CATALOG_BUNDLE_ITEM_ROBUX_UPSELL:
      case TRIGGERING_CONTEXT.WEB_PAID_GAME_ROBUX_UPSELL:
      case TRIGGERING_CONTEXT.WEB_GAME_PASS_ROBUX_UPSELL:
      case TRIGGERING_CONTEXT.WEB_DEVELOPER_PRODUCT_ROBUX_UPSELL:
      case TRIGGERING_CONTEXT.WEB_PRIVATE_SERVER_ROBUX_UPSELL:
      case TRIGGERING_CONTEXT.WEB_CATALOG_CART_ROBUX_UPSELL:
      case TRIGGERING_CONTEXT.WEB_ROBUX_GIFT_PURCHASE:
      case TRIGGERING_CONTEXT.WEB_ROBUX_GIFT_POST_CHECKOUT:
      case TRIGGERING_CONTEXT.WEB_GIFT_CARD_PURCHASE:
      case TRIGGERING_CONTEXT.WEB_REDEEM_PAGE:
      case TRIGGERING_CONTEXT.WEB_PAYMENT_METHODS_SETTING:
      case TRIGGERING_CONTEXT.WEB_CATALOG_SINGLE_ITEM_PLUS_UPSELL:
      case TRIGGERING_CONTEXT.WEB_CATALOG_RESALE_ITEM_PLUS_UPSELL:
      case TRIGGERING_CONTEXT.WEB_CATALOG_BUNDLE_ITEM_PLUS_UPSELL:
      case TRIGGERING_CONTEXT.WEB_GAME_PASS_PLUS_UPSELL:
      case TRIGGERING_CONTEXT.WEB_DEVELOPER_PRODUCT_PLUS_UPSELL:
      case TRIGGERING_CONTEXT.WEB_PRIVATE_SERVER_PLUS_UPSELL:
      case TRIGGERING_CONTEXT.WEB_DEVELOPER_SUBSCRIPTION_PLUS_UPSELL:
      case TRIGGERING_CONTEXT.WEB_APP_THEME_PLUS_UPSELL:
      default:
        return triggerContext;
    }
  }

  /**
   * Dispatch Custom Event helper method
   * Make the event dispatch work in IE 11
   *
   * CustomEvent is half-supported by IE11 but it has been polyfill-ed
   * But to avoid misuse in the future, use this method to dispatch event
   *
   * @param eventName
   */
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public dispatchCustomEvent(eventName: CUSTOM_EVENT): void {
    window.dispatchEvent(new CustomEvent(eventName));
  }
}

const paymentFlowAnalyticsService = new PaymentFlowAnalyticsService();

setupExternalEventListeners(paymentFlowAnalyticsService);

export default paymentFlowAnalyticsService;
