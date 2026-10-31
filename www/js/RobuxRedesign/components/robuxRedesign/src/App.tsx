import { useMemo, useEffect } from "react";
import { setItem } from "@rbx/core-lib/local-storage";
import { getCurrentUser } from "@rbx/www-common/user";
import { useFirstTimePurchaseConsent } from "@rbx/payments/firstTimePurchaseConsent";
import { DeviceMeta } from "@rbx/www-common/device/types";
import {
  BuyRobuxPageContext,
  BuyRobuxPageContextProps,
  BuyRobuxUrlParams,
} from "./contexts/BuyRobuxPageContext";
import { useBonusItem } from "./hooks/useBonusItem";
import { useRobuxBalance } from "./hooks/useRobuxBalance";
import { useThumbnails } from "./hooks/useThumbnails";
import { EnhancedBuyRobuxPageData, PaymentSession } from "./types/buyRobuxPageData";
import { TrackingContainer } from "./containers/TrackingContainer";
import { PurchasingContainer } from "./containers/PurchasingContainer";
import { usePurchaseUrls } from "./hooks/purchase/usePurchaseUrls";
import { BuyRobuxPage } from "./components/BuyRobuxPage";
import useRedirect from "./hooks/useRedirect";
import { isRedirectPlatformEligible } from "./utils/isRedirectPlatformEligible";
import { withApiMetrics } from "./utils/publishMetric";

const PAYMENT_SESSION_LOCAL_STORAGE_KEY_V2 =
  `paymentSession-${getCurrentUser()?.id ?? "loggedout"}` as const;
const persistPaymentSessionToLocalStorage = (paymentSession: PaymentSession): void => {
  // @ts-expect-error -- This per-user key is generated dynamically and is not declared in LocalStorageRegistry.
  setItem(PAYMENT_SESSION_LOCAL_STORAGE_KEY_V2, paymentSession);
};

export type AppProps = {
  enhancedBuyRobuxPageData: EnhancedBuyRobuxPageData;
  urlParams: BuyRobuxUrlParams;
  deviceMeta: DeviceMeta;
};

export const App = ({ enhancedBuyRobuxPageData, urlParams, deviceMeta }: AppProps) => {
  useBonusItem();

  const {
    limitedTimeBonusItem,
    bonusItemDisplayName,
    bonusItemId,
    bonusItemRootPlaceId,
    giftingUrl,
    isSubscriber,
    productIds,
    sectionNames,
    subscriptionProductIds,
    upsellProduct,
    collectibleBonusItemMetadata,
    productBadgeSlotCount,
    atLeastOneProductHasBonusAmount,
    buyRobuxPageData,
  } = enhancedBuyRobuxPageData;

  const { paymentSession, purchaseFlowId } = enhancedBuyRobuxPageData.buyRobuxPageData;

  useEffect(() => {
    // Unauth payloads have no paymentSession, so there's nothing to persist.
    if (!paymentSession) {
      return;
    }
    persistPaymentSessionToLocalStorage(paymentSession);
  }, [paymentSession]);

  const getPurchaseUrl = usePurchaseUrls(paymentSession, deviceMeta);
  const robuxBalance = useRobuxBalance();
  const { shouldShowFirstTimePurchaseConsent, markConsentAcknowledged } =
    useFirstTimePurchaseConsent(getCurrentUser()?.id, withApiMetrics);
  const redirect = useRedirect({
    deviceMeta,
    paymentSession,
    isEnabled:
      isRedirectPlatformEligible(deviceMeta) &&
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
      deviceMeta,
      limitedTimeBonusItem,
      bonusItemBannerImageUrl,
      bonusItemDisplayName,
      bonusItemId,
      bonusItemImageUrl,
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
      urlParams,
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
      urlParams,
      redirect,
      collectibleBonusItemMetadata,
      shouldShowFirstTimePurchaseConsent,
      markConsentAcknowledged,
      productBadgeSlotCount,
      atLeastOneProductHasBonusAmount,
      deviceMeta,
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
