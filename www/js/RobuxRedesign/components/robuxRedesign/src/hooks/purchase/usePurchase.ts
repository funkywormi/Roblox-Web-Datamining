/* eslint-disable no-void */
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { trackCounter, trackError } from "../../observability";
import { TrackingContext } from "../../contexts/TrackingContext";
import { Product } from "../../types/buyRobuxPageData";
import {
  isInApp,
  isInUniversalApp,
  isOnDesktop,
  isSamsungGalaxyStoreApp,
} from "../../utils/platform";
import { useEmailVerification } from "../useEmailVerification";
import { usePurchaseEligibility } from "../purchaseEligibility/usePurchaseEligibility";
import { usePurchaseWarning } from "../purchaseWarning/usePurchaseWarning";
import { QuickPay } from "../quickPay/useQuickPay";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { ModalContext } from "../../contexts/ModalContext";
import { BuyRobuxPageSectionType, PurchaseContextProps } from "../../contexts/PurchaseContext";
import { SamsungPaymentMethods } from "../samsungPaymentMethods/useSamsungPaymentMethods";
import { loginRedirectService } from "../../services/loginRedirectService";
import { trackRedirectClickTime } from "../../utils/trackRedirectClickTime";

export function usePurchase(
  {
    isQuickPay,
    paymentProfiles,
    markRedirectHandled: markQuickPayRedirectHandled,
    preparePaymentForQuickPay,
    shouldRedirectToPurchase: shouldRedirectToPurchaseForQuickPay,
  }: QuickPay,
  {
    markRedirectHandled: markSamsungRedirectHandled,
    shouldRedirectToPurchase: shouldRedirectToPurchaseForSamsung,
  }: SamsungPaymentMethods,
): PurchaseContextProps {
  const { getPurchaseUrl, upsellProduct, redirect, shouldShowFirstTimePurchaseConsent } =
    useContext(BuyRobuxPageContext);
  const {
    quickPay: { openModal: openQuickPayModal },
    samsungPaymentMethods: { openModal: openSamsungPaymentMethodsModal },
    redirectError: { openModal: openRedirectErrorModal },
    firstTimePurchaseConsent: { openModal: openFirstTimePurchaseConsentModal },
  } = useContext(ModalContext);
  const { trackPurchase, trackRedirectClick } = useContext(TrackingContext);

  const { isStoppedByPurchaseWarning } = usePurchaseWarning();
  const { isUserEligibleForPurchase } = usePurchaseEligibility();
  const { isVerificationUpsellEnabled, verifyEmail } = useEmailVerification();

  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [productSectionType, setProductSectionType] = useState<
    BuyRobuxPageSectionType | undefined
  >();
  const [isSubscriptionProduct, setIsSubscriptionProduct] = useState<boolean>(false);
  const [isBonusProduct, setIsBonusProduct] = useState<boolean>(false);
  const [purchaseUrl, setPurchaseUrl] = useState<string>("");
  const [pendingConsentPurchase, setPendingConsentPurchase] = useState<{
    product: Product;
    isSub: boolean;
    isBonus: boolean;
    sectionType?: BuyRobuxPageSectionType;
  }>();

  const purchaseProductPostPurchaseWarning = useCallback(
    (_product: Product, _isSub: boolean, url: string) => {
      if (isOnDesktop) {
        trackCounter("DesktopPurchaseRedirect");
        window.location.href = url;
        return;
      }

      if (!isInApp) {
        trackCounter("UnsupportedPlatform");
        return;
      }

      trackCounter("MobilePurchaseRedirect");
      window.location.href = url;
    },
    [],
  );

  const purchaseProductPostVerificationUpsell = useCallback(
    async (product: Product, isBonus: boolean, isSub: boolean, url: string) => {
      if (isQuickPay && !isSub) {
        await preparePaymentForQuickPay(product, isBonus, isSub);
        return;
      }

      const isStopped = await isStoppedByPurchaseWarning(
        product,
        isSub,
        url,
        purchaseProductPostPurchaseWarning,
      );
      if (isStopped) {
        trackCounter("StoppedPurchaseWarning", { action: "PurchaseFlow" });
        return;
      }

      purchaseProductPostPurchaseWarning(product, isSub, url);
    },
    [
      isQuickPay,
      preparePaymentForQuickPay,
      isStoppedByPurchaseWarning,
      purchaseProductPostPurchaseWarning,
    ],
  );

  const purchaseProductPostSamsung = useCallback(
    async (
      product: Product,
      isSub: boolean,
      isBonus: boolean,
      sectionType?: BuyRobuxPageSectionType,
    ): Promise<void> => {
      trackCounter(isQuickPay ? "StartQuickPay" : "StartPurchase");
      trackPurchase(product, isSub, sectionType);
      const url = getPurchaseUrl(product, isSub);
      setPurchaseUrl(url);

      const isEligible = await isUserEligibleForPurchase();
      if (!isEligible) {
        trackCounter("IneligiblePurchase");
        return;
      }

      if (isVerificationUpsellEnabled) {
        // the EmailVerificationService call is not currently well typed,
        // so wrap it in a try/catch for safety!
        let data: Record<string, unknown>;
        try {
          data = await verifyEmail(isSub)(() => {
            void (async () => {
              trackCounter("EmailVerificationComplete");
              await purchaseProductPostVerificationUpsell(product, isBonus, isSub, url);
            })();
          });
        } catch (e) {
          trackError("EmailVerificationException", null, e);
          return;
        }

        if (data.emailAddress) {
          await purchaseProductPostVerificationUpsell(product, isBonus, isSub, url);
          return;
        }

        trackCounter("EmailVerificationModalShown");
        return;
      }

      await purchaseProductPostVerificationUpsell(product, isBonus, isSub, url);
    },
    [
      isQuickPay,
      trackPurchase,
      getPurchaseUrl,
      isUserEligibleForPurchase,
      isVerificationUpsellEnabled,
      verifyEmail,
      purchaseProductPostVerificationUpsell,
    ],
  );

  const purchaseRedirectProduct: PurchaseContextProps["purchaseProduct"] = useCallback(
    ({ product, event, isSubscription }) => {
      trackRedirectClickTime();
      if (!redirect) {
        event.preventDefault();
        trackCounter("UnexpectedPurchaseRedirectCall");
        return;
      }

      if (redirect.url === "") {
        event.preventDefault();
        trackCounter("PurchaseRedirectUrlEmpty");
        redirect.refreshAuthTicket();
        openRedirectErrorModal();
        return;
      }

      const loginRedirectVersion = redirect.isInExperiment
        ? redirect.url.includes("/v2")
          ? "v2"
          : "v1"
        : undefined;
      trackRedirectClick({
        isSubscriptionRedirect: isSubscription,
        loginRedirectVersion,
        product,
      });

      redirect.refreshAuthTicket();
    },
    [redirect, trackRedirectClick, openRedirectErrorModal],
  );

  type bool = boolean;

  const purchaseProductPostConsent = useCallback(
    async (
      product: Product,
      isSub: bool = false,
      isBonus: bool = false,
      sectionType?: BuyRobuxPageSectionType,
    ): Promise<void> => {
      setSelectedProduct(product);
      setProductSectionType(sectionType);
      setIsSubscriptionProduct(isSub);
      setIsBonusProduct(isBonus);

      if (isSamsungGalaxyStoreApp) {
        openSamsungPaymentMethodsModal(product, isSub, isBonus);
        return;
      }

      await purchaseProductPostSamsung(product, isSub, isBonus, sectionType);
    },
    [openSamsungPaymentMethodsModal, purchaseProductPostSamsung],
  );

  const purchaseNonRedirectProduct = useCallback(
    async (
      product: Product,
      isSub: bool = false,
      isBonus: bool = false,
      sectionType?: BuyRobuxPageSectionType,
    ): Promise<void> => {
      if (shouldShowFirstTimePurchaseConsent === false) {
        await purchaseProductPostConsent(product, isSub, isBonus, sectionType);
        return;
      }

      if (shouldShowFirstTimePurchaseConsent === undefined) {
        trackCounter("FirstTimePurchaseConsentNotFetchedInTime");
        setPendingConsentPurchase({ product, isSub, isBonus, sectionType });
        return;
      }

      openFirstTimePurchaseConsentModal(() => {
        void purchaseProductPostConsent(product, isSub, isBonus, sectionType);
      });
    },
    [
      shouldShowFirstTimePurchaseConsent,
      openFirstTimePurchaseConsentModal,
      purchaseProductPostConsent,
    ],
  );

  const purchaseProduct: PurchaseContextProps["purchaseProduct"] = useCallback(
    purchaseOptions => {
      const { product, isRedirect, isSubscription, isBonus, sectionType } = purchaseOptions;
      if (isRedirect) {
        loginRedirectService.logLayerExposure().catch((error: unknown) => {
          trackError("LoginRedirectLayerExposureError", null, error);
        });
        purchaseRedirectProduct(purchaseOptions);
      } else {
        void purchaseNonRedirectProduct(product, isSubscription, isBonus, sectionType);
      }
    },
    [purchaseRedirectProduct, purchaseNonRedirectProduct],
  );

  useEffect(() => {
    if (shouldShowFirstTimePurchaseConsent === undefined || !pendingConsentPurchase) {
      return;
    }

    setPendingConsentPurchase(undefined);

    const { product, isSub, isBonus, sectionType } = pendingConsentPurchase;

    if (shouldShowFirstTimePurchaseConsent) {
      openFirstTimePurchaseConsentModal(() => {
        void purchaseProductPostConsent(product, isSub, isBonus, sectionType);
      });
      return;
    }

    void purchaseProductPostConsent(product, isSub, isBonus, sectionType);
  }, [
    shouldShowFirstTimePurchaseConsent,
    pendingConsentPurchase,
    openFirstTimePurchaseConsentModal,
    purchaseProductPostConsent,
  ]);

  useEffect(() => {
    if (!shouldRedirectToPurchaseForQuickPay || !selectedProduct) {
      return;
    }

    purchaseProductPostPurchaseWarning(selectedProduct, isSubscriptionProduct, purchaseUrl);
    markQuickPayRedirectHandled();
  }, [
    shouldRedirectToPurchaseForQuickPay,
    selectedProduct,
    purchaseProductPostPurchaseWarning,
    isSubscriptionProduct,
    purchaseUrl,
    markQuickPayRedirectHandled,
  ]);

  useEffect(() => {
    if (!shouldRedirectToPurchaseForSamsung || !selectedProduct) {
      return;
    }

    void purchaseProductPostSamsung(
      selectedProduct,
      isSubscriptionProduct,
      isBonusProduct,
      productSectionType,
    );
    markSamsungRedirectHandled();
  }, [
    shouldRedirectToPurchaseForSamsung,
    selectedProduct,
    purchaseProductPostSamsung,
    isSubscriptionProduct,
    isBonusProduct,
    productSectionType,
    markSamsungRedirectHandled,
  ]);

  useEffect(() => {
    if (!isQuickPay || !isInUniversalApp || !upsellProduct || !paymentProfiles.length) {
      return;
    }

    trackCounter("QuickPayUpsell");
    openQuickPayModal(upsellProduct);
    void purchaseNonRedirectProduct(upsellProduct);
  }, [isQuickPay, upsellProduct, paymentProfiles, openQuickPayModal, purchaseNonRedirectProduct]);

  return useMemo(
    () => ({
      selectedProduct,
      purchaseProduct,
      purchaseNonRedirectProduct,
    }),
    [selectedProduct, purchaseProduct, purchaseNonRedirectProduct],
  );
}
