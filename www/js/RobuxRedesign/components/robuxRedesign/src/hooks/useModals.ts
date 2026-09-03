import { useCallback, useContext, useMemo, useState } from "react";
import { PurchaseWarningAction } from "../services/purchaseWarningsService";
import { TrackingContext } from "../contexts/TrackingContext";
import { Product } from "../types/buyRobuxPageData";
import { trackCounter } from "../observability";

export type Modals = {
  purchaseDisabled: {
    closeModal: () => void;
    hasUserDisabledPurchases: boolean;
    isOpen: boolean;
    openModal: (vpcOptimization: boolean, userDisablePurchases: boolean) => void;
    showVPCOptimization: boolean;
  };

  purchaseWarning: {
    closeModal: () => void;
    action: PurchaseWarningAction | undefined;
    continuePurchase: (() => void) | undefined;
    isOpen: boolean;
    openModal: (action: PurchaseWarningAction, callback: () => void) => void;
  };

  quickPay: {
    closeModal: () => void;
    isOpen: boolean;
    openModal: (product: Product) => void;
  };

  quickPay3DS: {
    closeModal: () => void;
    isOpen: boolean;
    openModal: (redirectToUrl: string) => void;
    url: string;
  };

  robuxGifting: {
    closeModal: () => void;
    isOpen: boolean;
    openModal: () => void;
  };

  redirectError: {
    closeModal: () => void;
    isOpen: boolean;
    openModal: () => void;
  };
  samsungPaymentMethods: {
    closeModal: () => void;
    isBonus: boolean;
    isOpen: boolean;
    isSubscription: boolean;
    openModal: (product: Product, isSubscription: boolean, isBonus: boolean) => void;
    product: Product | undefined;
  };

  firstTimePurchaseConsent: {
    closeModal: () => void;
    continuePurchase: (() => void) | undefined;
    isOpen: boolean;
    openModal: (callback: () => void) => void;
  };
};

export function useModals(): Modals {
  const {
    trackPurchaseDisabledShown,
    trackPurchaseWarningShown,
    trackQuickPayShown,
    trackQuickPay3DSShown,
    trackRobuxGiftShown,
    trackSamsungPaymentMethodsShown,
  } = useContext(TrackingContext);

  const [isPurchaseWarningModalOpen, setIsPurchaseWarningModalOpen] = useState<boolean>(false);
  const [isPurchaseDisabledModalOpen, setIsPurchaseDisabledModalOpen] = useState<boolean>(false);
  const [isQuickPayModalOpen, setIsQuickPayModalOpen] = useState<boolean>(false);
  const [isQuickPay3DSModalOpen, setIsQuickPay3DSModalOpen] = useState<boolean>(false);
  const [isRobuxGiftingModalOpen, setIsRobuxGiftingModalOpen] = useState<boolean>(false);
  const [isRedirectErrorModalOpen, setIsRedirectErrorModalOpen] = useState<boolean>(false);
  const [isSamsungPaymentMethodsModalOpen, setIsSamsungPaymentMethodsModalOpen] =
    useState<boolean>(false);

  const [purchaseWarningAction, setPurchaseWarningAction] = useState<
    PurchaseWarningAction | undefined
  >();
  const [purchaseWarningCallback, setPurchaseWarningCallback] = useState<
    (() => void) | undefined
  >();

  const [samsungPaymentMethodsProductIsBonus, setSamsungPaymentMethodsProductIsBonus] =
    useState<boolean>(false);
  const [
    samsungPaymentMethodsProductIsSubscription,
    setSamsungPaymentMethodsProductIsSubscription,
  ] = useState<boolean>(false);
  const [samsungPaymentMethodsProduct, setSamsungPaymentMethodsProduct] = useState<
    Product | undefined
  >();

  const [hasUserDisabledPurchases, setHasUserDisabledPurchases] = useState(false);
  const [showVPCOptimization, setShowVPCOptimization] = useState(false);

  const [url, setUrl] = useState("");

  const [isFirstTimePurchaseConsentModalOpen, setIsFirstTimePurchaseConsentModalOpen] =
    useState(false);
  const [firstTimePurchaseConsentCallback, setFirstTimePurchaseConsentCallback] = useState<
    (() => void) | undefined
  >();

  const openPurchaseDisabledModal = useCallback(
    (vpcOptimization: boolean, userDisablePurchases: boolean): void => {
      trackPurchaseDisabledShown(vpcOptimization);

      setShowVPCOptimization(vpcOptimization);
      setHasUserDisabledPurchases(userDisablePurchases);
      setIsPurchaseDisabledModalOpen(true);
    },
    [trackPurchaseDisabledShown],
  );

  const openPurchaseWarningModal = useCallback(
    (action: PurchaseWarningAction, callback: () => void): void => {
      trackPurchaseWarningShown(action);

      setPurchaseWarningAction(action);
      setPurchaseWarningCallback(() => callback); // Wrap to store the function value (otherwise React treats it as an updater and invokes it).

      setIsPurchaseWarningModalOpen(true);
    },
    [trackPurchaseWarningShown],
  );

  const openQuickPayModal = useCallback(
    (product: Product): void => {
      trackQuickPayShown(product);

      setIsQuickPayModalOpen(true);
    },
    [trackQuickPayShown],
  );

  const openQuickPay3DSModal = useCallback(
    (redirectToUrl: string): void => {
      trackQuickPay3DSShown();

      setUrl(redirectToUrl);
      setIsQuickPay3DSModalOpen(true);
    },
    [trackQuickPay3DSShown],
  );

  const openRobuxGiftingModal = useCallback((): void => {
    trackRobuxGiftShown();

    setIsRobuxGiftingModalOpen(true);
  }, [trackRobuxGiftShown]);

  const openSamsungPaymentMethodsModal = useCallback(
    (product: Product, isSubscription: boolean, isBonus: boolean): void => {
      trackSamsungPaymentMethodsShown();

      setSamsungPaymentMethodsProduct(product);
      setSamsungPaymentMethodsProductIsSubscription(isSubscription);
      setSamsungPaymentMethodsProductIsBonus(isBonus);
      setIsSamsungPaymentMethodsModalOpen(true);
    },
    [trackSamsungPaymentMethodsShown],
  );

  const purchaseDisabledModalClosed = useCallback(() => {
    setIsPurchaseDisabledModalOpen(false);
    setShowVPCOptimization(false);
    setHasUserDisabledPurchases(false);
  }, []);

  const purchaseWarningModalClosed = useCallback(() => {
    setIsPurchaseWarningModalOpen(false);
    setPurchaseWarningAction(undefined);
    setPurchaseWarningCallback(undefined);
  }, []);

  const quickPayModalClosed = useCallback(() => {
    setIsQuickPayModalOpen(false);
  }, []);

  const quickPay3DSModalClosed = useCallback(() => {
    setIsQuickPay3DSModalOpen(false);
  }, []);

  const robuxGiftingModalClosed = useCallback(() => {
    setIsRobuxGiftingModalOpen(false);
  }, []);

  const redirectErrorModalClosed = useCallback(() => {
    setIsRedirectErrorModalOpen(false);
  }, []);

  const openRedirectErrorModal = useCallback(() => {
    setIsRedirectErrorModalOpen(true);
  }, []);

  const samsungPaymentMethodsModalClosed = useCallback(() => {
    setIsSamsungPaymentMethodsModalOpen(false);
  }, []);

  const openFirstTimePurchaseConsentModal = useCallback((callback: () => void) => {
    trackCounter("FirstTimePurchaseConsentShown");
    setFirstTimePurchaseConsentCallback(() => callback);
    setIsFirstTimePurchaseConsentModalOpen(true);
  }, []);

  const firstTimePurchaseConsentModalClosed = useCallback(() => {
    setIsFirstTimePurchaseConsentModalOpen(false);
    setFirstTimePurchaseConsentCallback(undefined);
  }, []);

  return useMemo(
    () => ({
      purchaseDisabled: {
        closeModal: purchaseDisabledModalClosed,
        hasUserDisabledPurchases,
        isOpen: isPurchaseDisabledModalOpen,
        openModal: openPurchaseDisabledModal,
        showVPCOptimization,
      },
      purchaseWarning: {
        action: purchaseWarningAction,
        closeModal: purchaseWarningModalClosed,
        continuePurchase: purchaseWarningCallback,
        isOpen: isPurchaseWarningModalOpen,
        openModal: openPurchaseWarningModal,
      },
      quickPay: {
        closeModal: quickPayModalClosed,
        isOpen: isQuickPayModalOpen,
        openModal: openQuickPayModal,
      },
      quickPay3DS: {
        closeModal: quickPay3DSModalClosed,
        isOpen: isQuickPay3DSModalOpen,
        openModal: openQuickPay3DSModal,
        url,
      },
      robuxGifting: {
        closeModal: robuxGiftingModalClosed,
        isOpen: isRobuxGiftingModalOpen,
        openModal: openRobuxGiftingModal,
      },
      redirectError: {
        closeModal: redirectErrorModalClosed,
        isOpen: isRedirectErrorModalOpen,
        openModal: openRedirectErrorModal,
      },
      samsungPaymentMethods: {
        closeModal: samsungPaymentMethodsModalClosed,
        isBonus: samsungPaymentMethodsProductIsBonus,
        isOpen: isSamsungPaymentMethodsModalOpen,
        isSubscription: samsungPaymentMethodsProductIsSubscription,
        openModal: openSamsungPaymentMethodsModal,
        product: samsungPaymentMethodsProduct,
      },
      firstTimePurchaseConsent: {
        closeModal: firstTimePurchaseConsentModalClosed,
        continuePurchase: firstTimePurchaseConsentCallback,
        isOpen: isFirstTimePurchaseConsentModalOpen,
        openModal: openFirstTimePurchaseConsentModal,
      },
    }),
    [
      samsungPaymentMethodsModalClosed,
      samsungPaymentMethodsProductIsBonus,
      isSamsungPaymentMethodsModalOpen,
      samsungPaymentMethodsProductIsSubscription,
      openSamsungPaymentMethodsModal,
      samsungPaymentMethodsProduct,
      purchaseDisabledModalClosed,
      hasUserDisabledPurchases,
      isPurchaseDisabledModalOpen,
      openPurchaseDisabledModal,
      showVPCOptimization,
      purchaseWarningAction,
      purchaseWarningModalClosed,
      purchaseWarningCallback,
      isPurchaseWarningModalOpen,
      openPurchaseWarningModal,
      quickPayModalClosed,
      isQuickPayModalOpen,
      openQuickPayModal,
      quickPay3DSModalClosed,
      isQuickPay3DSModalOpen,
      openQuickPay3DSModal,
      url,
      robuxGiftingModalClosed,
      isRobuxGiftingModalOpen,
      openRobuxGiftingModal,
      redirectErrorModalClosed,
      isRedirectErrorModalOpen,
      openRedirectErrorModal,
      firstTimePurchaseConsentModalClosed,
      firstTimePurchaseConsentCallback,
      isFirstTimePurchaseConsentModalOpen,
      openFirstTimePurchaseConsentModal,
    ],
  );
}
