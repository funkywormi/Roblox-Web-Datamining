import { useMemo, useEffect } from "react";
import localStorageService from "@rbx/core-scripts/local-storage";
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import { useFirstTimePurchaseConsent } from "@rbx/payments/firstTimePurchaseConsent";
import { BuyRobuxPageContext, BuyRobuxPageContextProps } from "./contexts/BuyRobuxPageContext";
import { useBonusItem } from "./hooks/useBonusItem";
import { useBuyRobuxPage } from "./hooks/useBuyRobuxPage";
import { useRobuxBalance } from "./hooks/useRobuxBalance";
import { useThumbnails } from "./hooks/useThumbnails";
import { BuyRobuxPageData, PaymentSession } from "./types/buyRobuxPageData";
import { TrackingContainer } from "./containers/TrackingContainer";
import { PurchasingContainer } from "./containers/PurchasingContainer";
import { usePurchaseUrls } from "./hooks/purchase/usePurchaseUrls";
import { useStyleOverrides } from "./hooks/useStyleOverrides";
import { BuyRobuxPage } from "./components/BuyRobuxPage";
import { useBreakpoint } from "./hooks/useBreakpoint";
import useRedirect from "./hooks/useRedirect";
import { isRedirectPlatformEligible } from "./utils/isRedirectPlatformEligible";
import { withApiMetrics } from "./utils/publishMetric";

const PAYMENT_SESSION_LOCAL_STORAGE_KEY_V2 = `paymentSession-${CurrentUser?.userId ?? "loggedout"}`;
const persistPaymentSessionToLocalStorage = (paymentSession: PaymentSession): void => {
  localStorageService.setLocalStorage(PAYMENT_SESSION_LOCAL_STORAGE_KEY_V2, paymentSession);
};

export const App = (buyRobuxPageData: BuyRobuxPageData) => {
  const breakpoint = useBreakpoint();
  useBonusItem();

  const urlSearchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  useStyleOverrides(urlSearchParams);

  const buyRobuxPage = useBuyRobuxPage(buyRobuxPageData, urlSearchParams);
  const {
    limitedTimeBonusItem,
    bonusItemDisplayName,
    bonusItemId,
    bonusItemRootPlaceId,
    giftingUrl,
    isSubscriber,
    paymentSession,
    productIds,
    purchaseFlowId,
    sectionNames,
    subscriptionProductIds,
    upsellProduct,
    collectibleBonusItemMetadata,
    productBadgeSlotCount,
    atLeastOneProductHasBonusAmount,
  } = buyRobuxPage;

  useEffect(() => {
    // Unauth payloads have no paymentSession, so there's nothing to persist.
    if (!paymentSession) {
      return;
    }
    persistPaymentSessionToLocalStorage(paymentSession);
  }, [paymentSession]);

  const getPurchaseUrl = usePurchaseUrls(paymentSession);
  const robuxBalance = useRobuxBalance();
  const { shouldShowFirstTimePurchaseConsent, markConsentAcknowledged } =
    useFirstTimePurchaseConsent(CurrentUser?.userId, withApiMetrics);
  const redirect = useRedirect({
    paymentSession,
    isEnabled:
      isRedirectPlatformEligible() &&
      buyRobuxPageData.sections.some(
        section =>
          section.redirect ??
          section.personalizedBonus?.isRedirect ??
          section.limitedTimeBonus?.isRedirect ??
          section.subscriptionV2?.products.some(p => p.isRedirect),
      ),
  });
  const { bonusItemBannerImageUrl, bonusItemImageUrl, giftingAvatarImageUrl } = useThumbnails({
    bonusItemId,
    bonusItemRootPlaceId,
    giftingUrl,
  });

  const buyRobuxPageContextValue = useMemo(
    (): BuyRobuxPageContextProps => ({
      limitedTimeBonusItem,
      bonusItemBannerImageUrl,
      bonusItemDisplayName,
      bonusItemId,
      bonusItemImageUrl,
      breakpoint,
      buyRobuxPageData,
      getPurchaseUrl,
      giftingAvatarImageUrl,
      giftingUrl,
      isSubscriber,
      paymentSession,
      productIds,
      purchaseFlowId,
      robuxBalance,
      sectionNames,
      subscriptionProductIds,
      upsellProduct,
      urlSearchParams,
      redirect,
      collectibleBonusItemMetadata,
      shouldShowFirstTimePurchaseConsent,
      markConsentAcknowledged,
      productBadgeSlotCount,
      atLeastOneProductHasBonusAmount,
    }),
    [
      limitedTimeBonusItem,
      bonusItemId,
      bonusItemBannerImageUrl,
      bonusItemDisplayName,
      bonusItemImageUrl,
      breakpoint,
      buyRobuxPageData,
      getPurchaseUrl,
      giftingAvatarImageUrl,
      giftingUrl,
      isSubscriber,
      paymentSession,
      productIds,
      purchaseFlowId,
      robuxBalance,
      sectionNames,
      subscriptionProductIds,
      upsellProduct,
      urlSearchParams,
      redirect,
      collectibleBonusItemMetadata,
      shouldShowFirstTimePurchaseConsent,
      markConsentAcknowledged,
      productBadgeSlotCount,
      atLeastOneProductHasBonusAmount,
    ],
  );

  return (
    <BuyRobuxPageContext.Provider value={buyRobuxPageContextValue}>
      {/* Mount point for the generic challenge UI (e.g. 2SV) rendered by the
          axios interceptor in @rbx/core-scripts. Must be present in the DOM
          at all times so challenges can render */}
      <div id="generic-challenge-container" data-testid="generic-challenge-container" />
      <TrackingContainer>
        <PurchasingContainer>
          <BuyRobuxPage />
        </PurchasingContainer>
      </TrackingContainer>
    </BuyRobuxPageContext.Provider>
  );
};
