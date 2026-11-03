import { document, window } from "@rbx/core-lib/browser";
import { generateRandomUuid } from "@rbx/core-lib/uuid";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import environmentUrls from "@rbx/environment-urls";
import { Configuration, Tracker } from "@rbx/event-stream";
import { PaymentFlowContext } from "./paymentFlowContext";
import { trackCounter, trackError } from "./observability";
import {
  ASSET_TYPE,
  CUSTOM_EVENT,
  EVENT_NAME,
  PURCHASE_EVENT_TYPE,
  PURCHASE_STATUS,
  TRIGGERING_CONTEXT,
  VIEW_MESSAGE,
  VIEW_NAME,
  type EventName,
  type PurchaseEventType,
  type PurchaseStatus,
  type TriggeringContext,
  type ViewName,
} from "./constants";
import { setupExternalEventListeners } from "./externalEventListenerHelper";
import { isBrowser } from "./isBrowser";
import {
  type PaymentFlowAnalytics,
  type SendUserPurchaseFlowEventParams,
  type SendUserPurchaseStatusEventParams,
  type StartUpsellFlowParams,
} from "./types";

const firstNonEmpty = (...values: Array<string | undefined>): string => {
  for (const value of values) {
    if (value != null && value !== "") {
      return value;
    }
  }
  return "";
};

const SHARED_FLOW_UUID_KEY = "__rbxPaymentsFlowUuid";

const navigationEntryType = (entry: PerformanceEntry | undefined): string | undefined => {
  if (entry != null && "type" in entry && typeof entry.type === "string") {
    return entry.type;
  }
  return undefined;
};

const PLATFORM_CONTEXT_PAIRS = [
  {
    web: TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
    webview: TRIGGERING_CONTEXT.WEBVIEW_ROBUX_PURCHASE,
    mobileWeb: TRIGGERING_CONTEXT.MOBILE_WEB_ROBUX_PURCHASE,
  },
  {
    web: TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
    webview: TRIGGERING_CONTEXT.WEBVIEW_PREMIUM_PURCHASE,
    mobileWeb: TRIGGERING_CONTEXT.MOBILE_WEB_PREMIUM_PURCHASE,
  },
  {
    web: TRIGGERING_CONTEXT.WEB_ROBLOX_PLUS_PURCHASE,
    webview: TRIGGERING_CONTEXT.WEBVIEW_ROBLOX_PLUS_PURCHASE,
    mobileWeb: TRIGGERING_CONTEXT.MOBILE_WEB_ROBLOX_PLUS_PURCHASE,
  },
] as const;

const eventStreamTracker = new Tracker(
  new Configuration({
    baseUrl: `https://ecsv2.${environmentUrls.domain}/www`,
  }),
);

export class PaymentFlowAnalyticsService implements PaymentFlowAnalytics {
  public purchaseFlowUuid = "";

  public triggerContext?: TriggeringContext;

  /**
   * Same catalogs as the `ENUM_*` exports. Kept on the instance so
   * `paymentFlowAnalyticsService.ENUM_VIEW_NAME` keeps working during migration.
   * Prefer the unprefixed catalogs in new code. Remove these properties once
   * callers have migrated.
   */
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
    if (!isBrowser()) {
      return;
    }
    this.loadOrStartPaymentFlow();
  }

  /**
   * Load the pre-existing ctx if it exists and we detect an existing session
   * If no existing session or no pre-existing ctx, then we should start a new flow
   */
  private loadOrStartPaymentFlow(): void {
    if (window == null) {
      return;
    }
    try {
      // Try to load the pre-existing ctx if it exists and we detect an existing session
      if (!this.purchaseFlowUuid) {
        this.tryLoadPreExistingCtx();
      }
      // `@rbx/core-scripts/payments-flow` also writes RBXPaymentsFlowContext at import.
      // On a fresh visit each singleton would mint a uuid and the later save would split
      // the funnel. Share this page's id, and still ignore a stale cookie.
      if (!this.purchaseFlowUuid) {
        this.adoptSharedFlowUuid();
      }
      if (!this.purchaseFlowUuid) {
        const urlAnalyticId = PaymentFlowAnalyticsService.getUrlAnalyticId();
        this.purchaseFlowUuid = urlAnalyticId ?? generateRandomUuid();
        this.writePaymentFlowContextIntoCookie();
      }
      this.publishSharedFlowUuid();
    } catch (error) {
      trackError("UserPaymentFlowStartFlowError", null, error);
    }
  }

  /**
   * Returns the payment flow uuid
   */
  public getPaymentFlowUuid(): string {
    this.adoptSharedFlowUuid();
    return this.purchaseFlowUuid;
  }

  /**
   * Allows setting the payment flow uuid
   * Also persists the uuid and trigger context to local storage / cookie
   */
  public setPaymentFlowUuid(id: string): void {
    this.purchaseFlowUuid = id;
    this.publishSharedFlowUuid();
    this.writePaymentFlowContextIntoCookie();
  }

  /**
   * Helper method for the upsell process to start a new flow
   * When item purchase upsell happens, we could use this method to start the flow to add asset type info
   */
  public startRobuxUpsellFlow({
    assetType,
    isReseller = false,
    itemId = "",
  }: StartUpsellFlowParams): void {
    this.eventMetadata.item_type = assetType;
    this.eventMetadata.item_id = itemId;

    if (assetType === ASSET_TYPE.GAME_PASS) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_GAME_PASS_ROBUX_UPSELL;
    } else if (assetType === ASSET_TYPE.DEVELOPER_PRODUCT) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_DEVELOPER_PRODUCT_ROBUX_UPSELL;
    } else if (assetType === ASSET_TYPE.PLACE) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_PAID_GAME_ROBUX_UPSELL;
    } else if (assetType === ASSET_TYPE.PRIVATE_SERVER) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_PRIVATE_SERVER_ROBUX_UPSELL;
    } else if (assetType === ASSET_TYPE.BUNDLE || assetType === ASSET_TYPE.PACKAGE) {
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
   */
  public startRobloxPlusUpsellFlow({
    assetType,
    isReseller = false,
    itemId = "",
  }: StartUpsellFlowParams): void {
    this.eventMetadata.item_type = assetType;
    this.eventMetadata.item_id = itemId;

    if (isReseller) {
      this.triggerContext = TRIGGERING_CONTEXT.WEB_CATALOG_RESALE_ITEM_PLUS_UPSELL;
    } else {
      switch (assetType) {
        case ASSET_TYPE.GAME_PASS:
          this.triggerContext = TRIGGERING_CONTEXT.WEB_GAME_PASS_PLUS_UPSELL;
          break;
        case ASSET_TYPE.DEVELOPER_PRODUCT:
          this.triggerContext = TRIGGERING_CONTEXT.WEB_DEVELOPER_PRODUCT_PLUS_UPSELL;
          break;
        case ASSET_TYPE.PRIVATE_SERVER:
          this.triggerContext = TRIGGERING_CONTEXT.WEB_PRIVATE_SERVER_PLUS_UPSELL;
          break;
        case ASSET_TYPE.BUNDLE:
        case ASSET_TYPE.PACKAGE:
          this.triggerContext = TRIGGERING_CONTEXT.WEB_CATALOG_BUNDLE_ITEM_PLUS_UPSELL;
          break;
        case ASSET_TYPE.SUBSCRIPTION:
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
   * isMidPurchaseStep = true means there are ways outside of the regular flow to reach certain steps
   * in the purchasing flow that wouldn't have context.
   * For example: payment methods selection button — all flows go through that page on web, but the
   * user could reach that page by entering the URL. If reached by URL with no valid referrer, we
   * start a new flow using triggerContext as fallback.
   */
  public sendUserPurchaseFlowEvent({
    triggerContext,
    isMidPurchaseStep,
    viewName,
    purchaseEventType,
    viewMessage,
    eventMetadata = {},
    isTerminalView = false,
  }: SendUserPurchaseFlowEventParams): void {
    if (!isBrowser()) {
      return;
    }
    try {
      const sanitizedTriggerContext =
        PaymentFlowAnalyticsService.reclassifyPlatformTriggeringContext({ triggerContext });
      this.eventMetadata = { ...this.eventMetadata, ...eventMetadata };
      if (!viewName && !purchaseEventType && !viewMessage) {
        trackError("UserPaymentFlowWrongUsageOfMethod");
        return;
      }
      this.adoptSharedTriggerContext();
      if (!this.triggerContext) {
        this.triggerContext = sanitizedTriggerContext;
        this.writePaymentFlowContextIntoCookie();
        if (isMidPurchaseStep) {
          trackCounter("UserPaymentFlowMidPurchaseStepTriggeredWithoutCtx");
        }
      }
      this.sendEvent({
        eventName: EVENT_NAME.USER_PURCHASE_FLOW,
        viewName,
        purchaseEventType,
        viewMessage,
      });

      if (isTerminalView) {
        this.handleTerminalPage();
      }
    } catch (error) {
      trackError("UserPaymentFlowSendUserEventError", null, error);
    }
  }

  /**
   * Send a user purchase status event
   * A status event should never be used as flow starter but a middle of purchase state indicator
   */
  public sendUserPurchaseStatusEvent({
    triggerContext,
    status,
    viewMessage,
    viewName,
  }: SendUserPurchaseStatusEventParams): void {
    if (!isBrowser()) {
      return;
    }
    try {
      const sanitizedTriggerContext =
        PaymentFlowAnalyticsService.reclassifyPlatformTriggeringContext({ triggerContext });
      if (!status && !viewMessage && !viewName) {
        trackError("UserPaymentFlowWrongUsageOfMethod");
        return;
      }
      this.adoptSharedTriggerContext();
      if (!this.triggerContext) {
        this.triggerContext = sanitizedTriggerContext;
        this.writePaymentFlowContextIntoCookie();
      }

      this.sendEvent({
        eventName: EVENT_NAME.USER_PURCHASE_STATUS,
        viewName,
        viewMessage,
        status,
      });

      if (PaymentFlowAnalyticsService.isTerminalView(viewName)) {
        this.handleTerminalPage();
      }
    } catch (error) {
      trackError("UserPaymentFlowSendStatusEventError", null, error);
    }
  }

  private adoptSharedTriggerContext(): void {
    if (this.triggerContext) {
      return;
    }
    this.adoptSharedFlowUuid();
    const existing = PaymentFlowContext.loadFromCookie();
    if (
      existing?.triggeringContext != null &&
      existing.purchaseFlowUuid === this.purchaseFlowUuid
    ) {
      this.triggerContext = existing.triggeringContext;
    }
  }

  private adoptSharedFlowUuid(): void {
    const paymentsFlowWindow = window;
    if (paymentsFlowWindow == null || !(SHARED_FLOW_UUID_KEY in paymentsFlowWindow)) {
      return;
    }
    const sharedFlowUuid = paymentsFlowWindow[SHARED_FLOW_UUID_KEY];
    if (typeof sharedFlowUuid === "string" && sharedFlowUuid !== "") {
      this.purchaseFlowUuid = sharedFlowUuid;
    }
  }

  private publishSharedFlowUuid(): void {
    const paymentsFlowWindow = window;
    if (paymentsFlowWindow == null || !this.purchaseFlowUuid) {
      return;
    }
    Object.assign(paymentsFlowWindow, { [SHARED_FLOW_UUID_KEY]: this.purchaseFlowUuid });
  }

  private writePaymentFlowContextIntoCookie(): void {
    this.adoptSharedFlowUuid();
    const flowCtx = new PaymentFlowContext(this.purchaseFlowUuid, this.triggerContext);
    flowCtx.save();
  }

  private sendEvent({
    eventName,
    viewName,
    purchaseEventType,
    viewMessage,
    status,
  }: {
    eventName: EventName;
    viewName?: ViewName;
    purchaseEventType?: PurchaseEventType;
    viewMessage?: string;
    status?: PurchaseStatus;
  }): void {
    this.adoptSharedFlowUuid();
    if (!this.purchaseFlowUuid || !this.triggerContext) {
      trackError("UserPaymentFlowSendEventWithoutUuidOrCtx");
      return;
    }
    const currentWindow = window;
    if (currentWindow == null) {
      return;
    }

    const referralUrl = PaymentFlowAnalyticsService.getReferralUrl();
    const previousView = PaymentFlowAnalyticsService.extractView(referralUrl);
    const currentView = PaymentFlowAnalyticsService.extractView(currentWindow.location.href);
    const metadata = JSON.stringify(this.eventMetadata);

    eventStreamTracker.sendEventViaImg({
      target: "www",
      localTime: new Date(),
      eventType: eventName,
      context: this.triggerContext,
      additionalProperties: {
        purchase_flow_uuid: this.purchaseFlowUuid,
        view_name: viewName,
        purchase_event_type: purchaseEventType,
        view_message: viewMessage,
        status,
        refurl: referralUrl.substring(0, 200), // Max 200 should be sufficient for logging urls
        prev_view_path: previousView,
        current_view_path: currentView,
        event_metadata: metadata,
      },
    });
  }

  private tryLoadPreExistingCtx(): void {
    const currentDocument = document;
    const currentWindow = window;
    if (currentDocument == null || currentWindow == null) {
      return;
    }
    try {
      const { referrer } = currentDocument;
      const isInternalNavigation =
        referrer && new URL(referrer).hostname.endsWith(environmentUrls.domain);
      const navigation = currentWindow.performance.getEntriesByType("navigation")[0];
      const navigationType = navigationEntryType(navigation);
      const isBrowserNavigation = navigationType === "back_forward" || navigationType === "reload";

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
    } catch (error) {
      trackError("UserPaymentFlowLoadPreExistingCtxError", null, error);
    }
  }

  private static extractView(referralUrl: string): string {
    if (!referralUrl) {
      return "";
    }

    const url = new URL(referralUrl);
    if (url.hostname.endsWith(`.${environmentUrls.domain}`)) {
      return url.pathname;
    }

    return "External";
  }

  private handleTerminalPage(): void {
    if (!this.purchaseFlowUuid) {
      return;
    }

    if (!this.triggerContext) {
      trackError("UserPaymentFlowFlowEndedWithoutTriggerContext");
      return;
    }

    PaymentFlowContext.stop();
    this.sendUserPurchaseStatusEvent({
      triggerContext: this.triggerContext,
      status: PURCHASE_STATUS.PAYMENT_FLOW_ENDED,
    });
    trackCounter("UserPaymentFlowFlowEnded");
  }

  private static isTerminalView(viewName?: ViewName): boolean {
    return viewName === VIEW_NAME.CHECKOUT_SUCCESS;
  }

  private static getReferralUrl(): string {
    const currentDocument = document;
    const currentWindow = window;
    if (currentDocument == null) {
      return "";
    }
    try {
      return firstNonEmpty(currentDocument.referrer, currentWindow?.frames.top?.document.referrer);
    } catch {
      return currentDocument.referrer;
    }
  }

  private static getUrlAnalyticId(): string | null {
    const currentWindow = window;
    if (currentWindow == null) {
      return null;
    }
    return new URLSearchParams(currentWindow.location.search).get("analyticId");
  }

  /**
   * Apps send WEB or WEBVIEW inconsistently. Reclassify Robux / Premium / Plus purchase
   * contexts from whether the user is actually in an app.
   */
  private static reclassifyPlatformTriggeringContext({
    triggerContext,
  }: {
    triggerContext: TriggeringContext;
  }): TriggeringContext {
    const meta = getDeviceMeta();
    const isInApp = [meta?.isAmazonApp, meta?.isUWPApp, meta?.isIosApp, meta?.isAndroidApp].some(
      value => value === true,
    );

    for (const { web, webview, mobileWeb } of PLATFORM_CONTEXT_PAIRS) {
      if (triggerContext === web || triggerContext === webview) {
        return isInApp ? webview : web;
      }
      if (triggerContext === mobileWeb) {
        return isInApp ? webview : mobileWeb;
      }
    }

    return triggerContext;
  }
}

export const paymentFlowAnalyticsService = new PaymentFlowAnalyticsService();

setupExternalEventListeners(paymentFlowAnalyticsService);

export * from "./constants";
export { PaymentFlowContext } from "./paymentFlowContext";
export type {
  PaymentFlowAnalytics,
  SendUserPurchaseFlowEventParams,
  SendUserPurchaseStatusEventParams,
  StartUpsellFlowParams,
} from "./types";
