/* eslint-disable no-void */
import { useCallback, useEffect, useState } from "react";
import { fireEvent } from "roblox-event-tracker";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { APICall, Feature, fireErrorCounter } from "../utils/apiEventsCounter";
import { Product, RobuxGiftErrorType } from "../constants/TypeDefinitions";
import {
  getUserName,
  getProducts,
  getGiftingMetadata,
  GetGiftingMetadataResponse,
  RecipientEligibilityType,
  PurchaserEligibilityType,
  preparePayment,
} from "../services/giftingProductsService";
import { filterProducts } from "../utils/gifting";
import useGiftingAnalytics from "./useGiftingAnalytics";
import { COUNTER_METRICS, DEFAULT_GIFT_MESSAGE, DEFAULT_USER_ID } from "../constants/Constants";

const USER_ID_REGEXP = /^\d+$/;

export enum GiftingProductsStep {
  INTRO = "Intro",
  CHECKOUT = "Checkout",
}

type UseGiftingProductsResult = {
  products: Product[];
  isUserEligible: boolean;
  isUserLoading: boolean;
  userId: number | null;
  userName: string;
  displayName: string;
  productId: number | null;
  message: string;
  messages: string[];
  step: GiftingProductsStep;
  robuxErrorType: RobuxGiftErrorType | null;
  showPhoneVerification: boolean;
  onReport: () => void;
  onNavigateToCheckout: () => void;
  onSelectProduct: (productId: number | null) => void;
  onSelectMessage: (messageKey: string) => void;
  onCheckout: () => void;
  onPhoneVerificationClose: (phoneVerificationSessionId: string | null) => void;
  onRobuxErrorClose: () => void;
  onChangeUserId: (id: number) => void;
  isSearchOpened: boolean;
  showSearchButton: boolean;
  legalDisclosureTranslationKey?: string;
  onOpenSearch: () => void;
};

type UseGiftingProductsProps = {
  translate: TranslateFunction;
};

export default function useGiftingProducts({
  translate: _translate,
}: UseGiftingProductsProps): UseGiftingProductsResult {
  const [step, setStep] = useState(GiftingProductsStep.INTRO);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [productId, setProductId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string>(DEFAULT_GIFT_MESSAGE);
  const [messages, setMessages] = useState<string[]>([]);
  const [isUserEligible, setIsUserEligible] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [metadata, setMetadata] = useState<GetGiftingMetadataResponse | null>(null);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [robuxErrorType, setRobuxErrorType] = useState<RobuxGiftErrorType | null>(null);
  const [isSearchOpened, setIsSearchOpened] = useState(false);
  const [showSearchButton, setShowSearchButton] = useState(false);

  const {
    setTrackingMessage,
    setTrackingProductId,
    setTrackingRequestorId,
    trackInvalidUser,
    trackStartBundleMessageSelection,
    trackStartPhoneVerification,
    trackClickUserSearchButton,
    trackSelectUserSearchResult,
  } = useGiftingAnalytics();

  useEffect(() => {
    setIsUserEligible(
      products.length > 0 &&
        metadata?.recipientEligibilityType === RecipientEligibilityType.Eligible &&
        (metadata.purchaserEligibilityType === PurchaserEligibilityType.Eligible ||
          metadata.purchaserEligibilityType ===
            PurchaserEligibilityType.EligibleAndDoesNotRequiresPhoneVerificationSession),
    );
  }, [products, metadata]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await getProducts();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- API response may be malformed at runtime despite its type
        if (!data?.products) {
          return;
        }
        setProducts(filterProducts(data.products));
      } catch (err) {
        const errorStatus =
          err instanceof Object && "status" in err && typeof err.status === "number"
            ? err.status
            : undefined;
        void fireErrorCounter(Feature.ROBUX_GIFTING, APICall.GET_PRODUCTS, errorStatus);
      }
    }
    void fetchProducts();

    let id: number | null = null;
    const urlObject = urlService.parseQueryString();
    if (typeof urlObject.user === "string" && urlObject.user.length > 0) {
      id = USER_ID_REGEXP.test(urlObject.user) ? Number.parseInt(urlObject.user, 10) : Number.NaN;
    }

    if (id === DEFAULT_USER_ID) {
      id = null;
    }

    setUserId(id);

    if (id && !Number.isNaN(id)) {
      setTrackingRequestorId(id);
    } else {
      setIsSearchOpened(true);
      setShowSearchButton(true);
      trackInvalidUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchUserName(id: number) {
      try {
        setIsSearchOpened(false);
        setIsUserLoading(true);

        const { data } = await getUserName(id);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- API response may be malformed at runtime despite its type
        if (!data?.data) {
          return;
        }
        const {
          data: [user],
        } = data;

        if (!user) {
          // display search button if user was not found
          setShowSearchButton(true);
        }

        setDisplayName(user?.displayName ?? "");
        setUserName(user?.name ?? "");
      } catch (err) {
        setIsSearchOpened(true);

        const errorStatus =
          err instanceof Object && "status" in err && typeof err.status === "number"
            ? err.status
            : undefined;
        void fireErrorCounter(Feature.ROBUX_GIFTING, APICall.GET_USER_NAME, errorStatus);

        switch (errorStatus) {
          case 400:
            fireEvent(COUNTER_METRICS.ROBUX_GIFTING_GET_USER_NAME_400);
            break;
          case 429:
            fireEvent(COUNTER_METRICS.ROBUX_GIFTING_GET_USER_NAME_429);
            break;
          case 500:
          case undefined:
          default:
            break;
        }
      } finally {
        setIsUserLoading(false);
      }
    }

    async function fetchMetadata(recipientId: number) {
      try {
        setRobuxErrorType(null);

        const { data } = await getGiftingMetadata(recipientId);

        setMetadata(data);
        if (data.messageForRecipientTranslationKeys) {
          setMessages(data.messageForRecipientTranslationKeys);
        }
        if (data.recipientEligibilityType === RecipientEligibilityType.Ineligible) {
          setRobuxErrorType(RobuxGiftErrorType.RecipientIneligible);
        } else if (data.purchaserEligibilityType === PurchaserEligibilityType.Ineligible) {
          setRobuxErrorType(RobuxGiftErrorType.PurchaserIneligible);
        } else {
          setRobuxErrorType(null);
        }
      } catch (err) {
        const errorStatus =
          err instanceof Object && "status" in err && typeof err.status === "number"
            ? err.status
            : undefined;
        void fireErrorCounter(Feature.ROBUX_GIFTING, APICall.GET_METADATA, errorStatus);
        setRobuxErrorType(RobuxGiftErrorType.PurchaserIneligible);
      }
    }

    if (userId && !Number.isNaN(userId)) {
      void fetchUserName(userId);
      void fetchMetadata(userId);
    }
  }, [setTrackingRequestorId, trackInvalidUser, userId]);

  const handleReport = () => {
    // TODO: Implement report user
  };

  const handleNavigateToCheckout = () => {
    setStep(GiftingProductsStep.CHECKOUT);
    trackStartBundleMessageSelection();
  };

  const handleSelectProduct = (id: number | null) => {
    setProductId(id);
    setTrackingProductId(id);
  };

  const handleSelectMessage = (key: string) => {
    setMessage(key);
    setTrackingMessage(key);
  };

  const handlePayment = async (sessionId: string | null) => {
    if (productId === null || userId === null) {
      return;
    }

    try {
      const { data } = await preparePayment(productId, message, sessionId, userId);

      // The response body is typed as always-present, but guard against a
      // malformed/empty payload at runtime before reading checkoutUrl.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime null-safety despite the non-nullable type
      if (typeof data?.providerPayload?.checkoutUrl === "string") {
        window.location.href = data.providerPayload.checkoutUrl;
      } else if (data.failureReason === "BlockedReceiverGiftLimitExceeded") {
        setRobuxErrorType(RobuxGiftErrorType.GiftLimit);
      } else {
        setRobuxErrorType(RobuxGiftErrorType.PreparePayment);
      }
    } catch (err) {
      const errorStatus =
        err instanceof Object && "status" in err && typeof err.status === "number"
          ? err.status
          : undefined;
      void fireErrorCounter(Feature.ROBUX_GIFTING, APICall.PREPARE_PAYMENT, errorStatus);
      setRobuxErrorType(RobuxGiftErrorType.PreparePayment);
    }
  };

  const handleCheckout = async () => {
    if (
      metadata?.purchaserEligibilityType ===
      PurchaserEligibilityType.EligibleAndDoesNotRequiresPhoneVerificationSession
    ) {
      await handlePayment(null);
    } else {
      if (productId === null) {
        return;
      }

      setShowPhoneVerification(true);
      trackStartPhoneVerification();
    }
  };

  const handlePhoneVerificationClose = async (sessionId: string | null) => {
    setShowPhoneVerification(false);
    await handlePayment(sessionId);
  };

  const handleRobuxErrorClose = useCallback(() => {
    setRobuxErrorType(null);
  }, []);

  const handleChangeUserId = useCallback(
    (id: number | null) => {
      setUserId(id);
      if (id && !Number.isNaN(id)) {
        setTrackingRequestorId(id);
        trackSelectUserSearchResult();
      }

      const query = new URLSearchParams(window.location.search);
      query.set("user", id?.toString() ?? "");
      const newUrl = `${window.location.pathname}?${query.toString()}`;

      window.history.replaceState({}, "", newUrl);
    },
    [setTrackingRequestorId, trackSelectUserSearchResult],
  );

  const handleOpenSearch = useCallback(() => {
    setIsSearchOpened(true);
    handleChangeUserId(null);
    trackClickUserSearchButton();
  }, [handleChangeUserId, trackClickUserSearchButton]);

  return {
    showPhoneVerification,
    products,
    isUserEligible,
    isUserLoading,
    userId,
    userName,
    displayName,
    message,
    messages,
    productId,
    step,
    robuxErrorType,
    isSearchOpened,
    showSearchButton,
    legalDisclosureTranslationKey: metadata?.legalDisclosureTranslationKey,
    onReport: handleReport,
    onNavigateToCheckout: handleNavigateToCheckout,
    onSelectProduct: handleSelectProduct,
    onSelectMessage: handleSelectMessage,
    onCheckout: () => {
      void handleCheckout();
    },
    onPhoneVerificationClose: (sessionId: string | null) => {
      void handlePhoneVerificationClose(sessionId);
    },
    onRobuxErrorClose: handleRobuxErrorClose,
    onChangeUserId: handleChangeUserId,
    onOpenSearch: handleOpenSearch,
  };
}
