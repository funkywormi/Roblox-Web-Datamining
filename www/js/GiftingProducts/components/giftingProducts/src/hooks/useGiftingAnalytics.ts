import { useCallback, useMemo, useState } from "react";
import { fireEvent } from "roblox-event-tracker";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { DeviceMeta } from "@rbx/core-scripts/legacy/Roblox";
import { COUNTER_METRICS } from "../constants/Constants";

type UseGiftingAnalyticsResponse = {
  setTrackingMessage: (key: string | null) => void;
  setTrackingProductId: (id: number | null) => void;
  setTrackingRequestorId: (id: number | string) => void;
  trackInvalidUser: () => void;
  trackStartBundleMessageSelection: () => void;
  trackStartPhoneVerification: () => void;
  trackSubmitPhoneNumber: () => void;
  trackAuthenticatePhoneNumber: () => void;
  trackRequestRobux: () => void;
  trackClickUserSearchButton: () => void;
  trackSelectUserSearchResult: () => void;
};

const useGiftingAnalytics = (): UseGiftingAnalyticsResponse => {
  const [message, setMessage] = useState<string>("");
  const [requestorId, setRequestorId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");

  const {
    ENUM_TRIGGERING_CONTEXT: {
      WEB_ROBUX_GIFT_PURCHASE,
      WEB_ROBUX_PURCHASE,
      WEBVIEW_ROBUX_PURCHASE,
    },
    ENUM_VIEW_NAME: {
      ROBUX_GIFT_MESSAGE_SELECTION,
      ROBUX_GIFT_PRODUCT_SELECTION,
      ROBUX_GIFT_LANDING_PAGE,
      ROBUX_GIFT_BUNDLE_MESSAGE_PAGE,
      ROBUX_GIFT_PHONE_SUBMISSION,
      ROBUX_GIFT_PHONE_AUTHENTICATION,
      ROBUX_GIFT_REQUEST_BANNER,
    },
    ENUM_PURCHASE_EVENT_TYPE: { USER_INPUT, VIEW_SHOWN },
    ENUM_VIEW_MESSAGE: { GIFT_NOW, CHECKOUT, CONTINUE, VERIFY, REQUEST_ROBUX },
  } = paymentFlowAnalyticsService;

  const deviceMeta = useMemo(() => DeviceMeta(), []);
  const isInApp = useMemo(() => {
    if (!deviceMeta) {
      return false;
    }
    // Use `||` (not `??`): these are booleans, and `??` would short-circuit on
    // the first `false` flag, breaking in-app detection for iOS/Android WebViews.
    return (
      deviceMeta.isAmazonApp ||
      deviceMeta.isUWPApp ||
      deviceMeta.isIosApp ||
      deviceMeta.isAndroidApp
    );
  }, [deviceMeta]);

  const trackInvalidUser = useCallback(() => {
    fireEvent(COUNTER_METRICS.ROBUX_GIFTING_LANDING_PAGE_HIT_INVALID_USER);
  }, []);

  const trackClickUserSearchButton = useCallback(() => {
    fireEvent(COUNTER_METRICS.ROBUX_GIFTING_USER_SEARCH_CLICK_BUTTON);
  }, []);

  const trackSelectUserSearchResult = useCallback(() => {
    fireEvent(COUNTER_METRICS.ROBUX_GIFTING_USER_SEARCH_SELECT_RESULT);
  }, []);

  const setTrackingMessage = useCallback(
    (key: string | null) => {
      const sanitizedMessage = key?.toString() ?? "";

      setMessage(sanitizedMessage);

      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        WEB_ROBUX_GIFT_PURCHASE,
        false,
        ROBUX_GIFT_MESSAGE_SELECTION,
        USER_INPUT,
        sanitizedMessage,
        {
          requestorId,
          productId,
          message: sanitizedMessage,
        },
      );
    },
    [WEB_ROBUX_GIFT_PURCHASE, ROBUX_GIFT_MESSAGE_SELECTION, USER_INPUT, requestorId, productId],
  );

  const setTrackingProductId = useCallback(
    (id: number | null) => {
      const sanitizedProductId = id?.toString() ?? "";

      setProductId(sanitizedProductId);

      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        WEB_ROBUX_GIFT_PURCHASE,
        false,
        ROBUX_GIFT_PRODUCT_SELECTION,
        USER_INPUT,
        undefined,
        {
          requestorId,
          productId: sanitizedProductId,
          message,
        },
      );
    },
    [WEB_ROBUX_GIFT_PURCHASE, ROBUX_GIFT_PRODUCT_SELECTION, USER_INPUT, requestorId, message],
  );

  const setTrackingRequestorId = useCallback(
    (id: number | string) => {
      const sanitizedRequestorId = id.toString();

      setRequestorId(sanitizedRequestorId);

      fireEvent(COUNTER_METRICS.ROBUX_GIFTING_LANDING_PAGE_HIT);
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        WEB_ROBUX_GIFT_PURCHASE,
        false,
        ROBUX_GIFT_LANDING_PAGE,
        VIEW_SHOWN,
        undefined,
        {
          requestorId: sanitizedRequestorId,
        },
      );
    },
    [WEB_ROBUX_GIFT_PURCHASE, ROBUX_GIFT_LANDING_PAGE, VIEW_SHOWN],
  );

  const trackStartBundleMessageSelection = useCallback(() => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      WEB_ROBUX_GIFT_PURCHASE,
      false,
      ROBUX_GIFT_LANDING_PAGE,
      USER_INPUT,
      GIFT_NOW,
      {
        requestorId,
      },
    );
  }, [WEB_ROBUX_GIFT_PURCHASE, ROBUX_GIFT_LANDING_PAGE, USER_INPUT, GIFT_NOW, requestorId]);

  const trackStartPhoneVerification = useCallback(() => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      WEB_ROBUX_GIFT_PURCHASE,
      false,
      ROBUX_GIFT_BUNDLE_MESSAGE_PAGE,
      USER_INPUT,
      CHECKOUT,
      {
        requestorId,
        productId,
        message,
      },
    );
  }, [
    WEB_ROBUX_GIFT_PURCHASE,
    ROBUX_GIFT_BUNDLE_MESSAGE_PAGE,
    USER_INPUT,
    CHECKOUT,
    requestorId,
    productId,
    message,
  ]);

  const trackSubmitPhoneNumber = useCallback(() => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      WEB_ROBUX_GIFT_PURCHASE,
      false,
      ROBUX_GIFT_PHONE_SUBMISSION,
      USER_INPUT,
      CONTINUE,
      {
        requestorId,
        productId,
        message,
      },
    );
  }, [
    WEB_ROBUX_GIFT_PURCHASE,
    ROBUX_GIFT_PHONE_SUBMISSION,
    USER_INPUT,
    CONTINUE,
    requestorId,
    productId,
    message,
  ]);

  const trackAuthenticatePhoneNumber = useCallback(() => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      WEB_ROBUX_GIFT_PURCHASE,
      false,
      ROBUX_GIFT_PHONE_AUTHENTICATION,
      USER_INPUT,
      VERIFY,
      {
        requestorId,
        productId,
        message,
      },
    );
  }, [
    WEB_ROBUX_GIFT_PURCHASE,
    ROBUX_GIFT_PHONE_AUTHENTICATION,
    USER_INPUT,
    VERIFY,
    requestorId,
    productId,
    message,
  ]);

  const trackRequestRobux = useCallback(() => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      isInApp ? WEBVIEW_ROBUX_PURCHASE : WEB_ROBUX_PURCHASE,
      false,
      ROBUX_GIFT_REQUEST_BANNER,
      USER_INPUT,
      REQUEST_ROBUX,
    );
  }, [
    isInApp,
    WEBVIEW_ROBUX_PURCHASE,
    WEB_ROBUX_PURCHASE,
    ROBUX_GIFT_REQUEST_BANNER,
    USER_INPUT,
    REQUEST_ROBUX,
  ]);

  return {
    setTrackingMessage,
    setTrackingRequestorId,
    setTrackingProductId,
    trackInvalidUser,
    trackStartBundleMessageSelection,
    trackStartPhoneVerification,
    trackSubmitPhoneNumber,
    trackAuthenticatePhoneNumber,
    trackRequestRobux,
    trackClickUserSearchButton,
    trackSelectUserSearchResult,
  };
};

export default useGiftingAnalytics;
