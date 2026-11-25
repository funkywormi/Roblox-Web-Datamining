import { GrantType, PeriodType, ProductType } from "@rbx/client-subscriptions-api/v2";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { isReferralEnabled } from "@rbx/core-scripts/meta/subscription";
import { resolveReferrerId } from "@rbx/payments/services/subscriptions";
import {
  consumeSubscriptionRedirectUrl,
  PLUS_REFERRALS_QUERY_PARAM,
} from "@rbx/subscriptions-common";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ErrorView from "./ErrorView";
import FreeTrialConfirmationView from "./FreeTrialConfirmationView";
import LoadingView from "./LoadingView";
import PlusReferralDashboard from "./PlusReferralDashboard";
import PurchaseView from "./PurchaseView";
import SubscriberView from "./SubscriberView";
import WelcomeView from "./WelcomeView";
import { robloxPlusApi } from "../clients/robloxSubscriptions";
import { subscriptionsV2Api } from "../clients/subscriptions";
import useLatest from "../hooks/useLatest";
import {
  getProductMonths,
  sortProductsByAllowanceAscending,
} from "../utils/subscriptionProductInfo";

type AppPolicyResponse = {
  DisableBlackbirdEntrypoints?: boolean;
  ShouldDeeplinkToReferral?: boolean;
};

const MEMBERSHIP_POLL_REFETCH_INTERVAL_MS = 3000;
const MEMBERSHIP_POLL_REFETCH_TIMEOUT_MS = 60000;

const FAE_FREE_TRIAL_PERIOD = PeriodType.Week;

const Content = () => {
  const deviceMeta = useMemo(() => getDeviceMeta(), []);

  // Temporary state to handle displaying the welcome view without page request
  // (simple workaround to avoid needing a router)
  const [isWelcome, setIsWelcome] = useState(() =>
    new URLSearchParams(window.location.search).has("welcome"),
  );

  const [isFreeTrialConfirmation, setIsFreeTrialConfirmation] = useState(() =>
    new URLSearchParams(window.location.search).has("faeFreeTrialConfirmation"),
  );

  const [isReferralsDashboard, setIsReferralsDashboard] = useState(
    () =>
      // Gated as well as read: the invite card that sets this param is already behind the
      // rollout, but the url outlives it in bookmarks and shared links. Without the gate those
      // still open the dashboard and spend a create-link call to reach the dead-link sheet.
      isReferralEnabled() &&
      new URLSearchParams(window.location.search).has(PLUS_REFERRALS_QUERY_PARAM),
  );

  // Only the invite card on this page opens the dashboard in place, so it is the only entry point
  // with a landing to come back to. Nav, home, and notifications arrive on `/plus?referrals`
  // directly, where the landing was never shown and closing should leave for home.
  const openedFromLandingRef = useRef(false);

  const [isPollingForMembership, setIsPollingForMembership] = useState(
    isWelcome || isFreeTrialConfirmation,
  );

  const robloxSubscriptionMembershipQuery = useQuery({
    queryKey: ["get-roblox-subscription-membership"],
    queryFn: async () => {
      const { subscriptions } = await subscriptionsV2Api.subscriptionsV2ListSubscriptions({
        productType: ProductType.Blackbird,
        expirationTimestampMsStart: Date.now(),
        resultsPerPage: 1,
        // A granted subscription can be active alongside a purchased one; the latest-expiring one is
        // the membership.
        descendingOrder: true,
      });
      return subscriptions[0] ?? null;
    },
    retry: 3,
    retryDelay: 100,
    refetchInterval: isPollingForMembership ? MEMBERSHIP_POLL_REFETCH_INTERVAL_MS : false,
  });

  const robloxSubscriptionMembership = useLatest(
    robloxSubscriptionMembershipQuery.data,
    () => robloxSubscriptionMembershipQuery.data !== undefined,
  );

  // Product id of the user's active subscription fetched above
  const activeSubscriptionProductId = robloxSubscriptionMembership?.productKey.id;

  // Confirm the active subscription is the 1-week FAE trial: match it against the FAE-granted catalog.
  // TODO: make the qualifying grant type(s) configurable via settings so additional trial
  // grants can be supported without a client deploy, instead of hardcoding GrantType.FaeFreeTrial.
  const faeTrialCheckQuery = useQuery({
    queryKey: ["check-fae-free-trial", activeSubscriptionProductId],
    queryFn: async () => {
      if (!activeSubscriptionProductId) {
        return false;
      }
      const { products } =
        await subscriptionsV2Api.subscriptionsV2ListAvailableSubscriptionProducts({
          productType: ProductType.Blackbird,
          includePurchased: true,
          grantType: GrantType.FaeFreeTrial,
        });
      const faeTrialProductId = products.find(
        product => product.periodType === FAE_FREE_TRIAL_PERIOD,
      )?.productKey.id;
      const result =
        faeTrialProductId !== undefined && faeTrialProductId === activeSubscriptionProductId;
      if (!result) {
        throw new Error("FAE trial product not found yet");
      }
      return true;
    },
    enabled: Boolean(robloxSubscriptionMembership),
    retry: failureCount => failureCount < 3,
    retryDelay: 100,
  });

  // The server decides what the list holds: every plan for a non-member, upgrades for an upgradeable
  // member, and nothing for other members. Any product offered to a member marks them upgradeable,
  // so plan change targets (includePlanChanges) must not be listed here.
  // Product info is sourced from the user's active subscription when subscribed; otherwise it
  // comes from the available-products list (extended terms and bundles included so the page
  // has every plan). This avoids a redundant GetSubscriptionProductInfo call for subscribed users.
  // This list feeds PurchaseView, which renders each product's eligibleOffers -- so on a referral
  // landing it is the surface that would otherwise advertise a free trial. Referral reward and
  // trial are mutually exclusive, and subscriptions-service suppresses the offer only when told
  // the referrer. Independent of skipEligibilityCheck: that flag gates purchase eligibility, not
  // referral/trial exclusivity. Keyed so a referral landing cannot be served a cached
  // non-referral list that still carries the trial, or the reverse.
  const referrerId = resolveReferrerId();

  const robloxAvailableProductsQuery = useQuery({
    queryKey: ["list-roblox-subscription-available-products", referrerId ?? null],
    queryFn: async () => {
      const { products } =
        await subscriptionsV2Api.subscriptionsV2ListAvailableSubscriptionProducts({
          productType: ProductType.Blackbird,
          // The server ignores includeUpgrades unless includePurchased is false.
          includePurchased: false,
          includeUpgrades: true,
          includeBundles: true,
          includeExtendedTermProducts: true,
          skipEligibilityCheck: true,
          // Omitted from the query string when undefined; the generated client only serializes
          // parameters it was actually given.
          referrerId,
        });
      return sortProductsByAllowanceAscending(products);
    },
    retry: 3,
    retryDelay: 100,
    refetchInterval: isPollingForMembership ? MEMBERSHIP_POLL_REFETCH_INTERVAL_MS : false,
  });

  const robloxAvailableProducts = useLatest(
    robloxAvailableProductsQuery.data,
    () => robloxAvailableProductsQuery.data !== undefined,
  );

  const robloxSubscriptionProduct = useLatest(
    robloxSubscriptionMembershipQuery.data?.productInfo ?? robloxAvailableProducts?.[0],
    () =>
      robloxSubscriptionMembershipQuery.data?.productInfo !== undefined ||
      robloxAvailableProducts !== undefined,
  );

  const robloxPlusUserBenefitsQuery = useQuery({
    queryKey: ["get-roblox-plus-user-benefits"],
    queryFn: () => robloxPlusApi.robloxPlusGetRobloxPlusUserBenefits(),
    enabled: Boolean(robloxSubscriptionMembership),
    retry: 3,
  });

  const appPolicyQuery = useQuery({
    queryKey: ["guac/app-policy"],
    queryFn: async (): Promise<AppPolicyResponse> => {
      try {
        return await callBehaviour<AppPolicyResponse>("app-policy");
      } catch {
        return {};
      }
    },
    retry: 3,
    retryDelay: 100,
    staleTime: Infinity,
  });

  const isEntrypointDisabled = useLatest(
    appPolicyQuery.data?.DisableBlackbirdEntrypoints === true,
    () => appPolicyQuery.data !== undefined,
  );

  const shouldDeeplinkToReferral =
    deviceMeta?.isInApp === true && appPolicyQuery.data?.ShouldDeeplinkToReferral === true;

  const enableWelcome = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("welcome", "");
    window.history.replaceState(null, "", url.toString());
    setIsWelcome(true);
  }, []);

  const dismissWelcome = useCallback(() => {
    const redirectUrl = consumeSubscriptionRedirectUrl();
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    window.history.replaceState(null, "", url.toString());
    setIsWelcome(false);
  }, []);

  const dismissFreeTrialConfirmation = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("faeFreeTrialConfirmation");
    window.history.replaceState(null, "", url.toString());
    setIsFreeTrialConfirmation(false);
  }, []);

  const enableReferralsDashboard = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set(PLUS_REFERRALS_QUERY_PARAM, "");
    window.history.replaceState(null, "", url.toString());
    openedFromLandingRef.current = true;
    setIsReferralsDashboard(true);
  }, []);

  const dismissReferralsDashboard = useCallback(() => {
    if (!openedFromLandingRef.current) {
      window.location.href = getAbsoluteUrl("/home");
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete(PLUS_REFERRALS_QUERY_PARAM);
    window.history.replaceState(null, "", url.toString());
    setIsReferralsDashboard(false);
  }, []);

  useEffect(() => {
    if (!isPollingForMembership) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsPollingForMembership(false);
    }, MEMBERSHIP_POLL_REFETCH_TIMEOUT_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [isPollingForMembership]);

  // The list empties once the server sees the membership, which for an upgradeable member means
  // the purchase.
  const hasMembershipLanded =
    Boolean(robloxSubscriptionMembershipQuery.data) &&
    robloxAvailableProductsQuery.data?.length === 0;

  const { refetch: refetchMembership } = robloxSubscriptionMembershipQuery;

  // When membership is detected during polling, show the appropriate view
  useEffect(() => {
    if (!isPollingForMembership || !hasMembershipLanded) {
      return;
    }

    let cancelled = false;
    // A membership read made alongside the list can predate the purchase, so read it again.
    refetchMembership()
      .then(() => {
        if (cancelled) {
          return;
        }
        setIsPollingForMembership(false);
        if (!isFreeTrialConfirmation) {
          enableWelcome();
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [
    enableWelcome,
    hasMembershipLanded,
    isFreeTrialConfirmation,
    isPollingForMembership,
    refetchMembership,
  ]);

  const onMobilePurchaseInitiated = useCallback(() => {
    setIsPollingForMembership(true);
  }, []);

  if (
    // A failed refetch keeps the last membership, so only a failed first load is an error.
    (robloxSubscriptionMembershipQuery.isLoadingError && !isPollingForMembership) ||
    appPolicyQuery.error ||
    !deviceMeta
  ) {
    return <ErrorView />;
  }

  if (
    robloxSubscriptionMembership === undefined ||
    robloxAvailableProductsQuery.isLoading ||
    isEntrypointDisabled === undefined
  ) {
    return <LoadingView />;
  }

  const hasMembership = robloxSubscriptionMembership !== null;
  // An empty or failed list means a member is subscribed and a non-member has nothing to buy,
  // except while polling, when the membership read can lag the purchase.
  const hasPurchasableProducts = (robloxAvailableProducts?.length ?? 0) > 0;
  if (!hasMembership && !hasPurchasableProducts && !isPollingForMembership) {
    return <ErrorView />;
  }

  if (robloxSubscriptionProduct === undefined) {
    return <LoadingView />;
  }

  const isSubscribed = hasMembership && !hasPurchasableProducts;

  if (isFreeTrialConfirmation) {
    // Wait for the grant to propagate. The membership poll keeps retrying until the subscription
    // is visible (or the poll times out), so we show loading rather than erroring during the wait.
    if (!hasMembership) {
      return isPollingForMembership ? <LoadingView /> : <ErrorView />;
    }
    // Membership is confirmed; verify it's specifically the FAE trial before showing the page.
    if (faeTrialCheckQuery.isLoading) {
      return <LoadingView />;
    }
    if (!faeTrialCheckQuery.data) {
      return <ErrorView />;
    }
    return (
      <FreeTrialConfirmationView
        robloxSubscriptionProduct={robloxSubscriptionProduct}
        onDismiss={dismissFreeTrialConfirmation}
      />
    );
  }

  // Until the membership is read again, it can still be the subscription held before the purchase.
  if (isPollingForMembership && hasMembershipLanded) {
    return <LoadingView />;
  }

  if (isWelcome) {
    if (isSubscribed) {
      return (
        <WelcomeView
          deviceMeta={deviceMeta}
          robloxSubscriptionMembership={robloxSubscriptionMembership}
          robloxSubscriptionProduct={robloxSubscriptionProduct}
          onDismiss={dismissWelcome}
        />
      );
    } else if (isPollingForMembership) {
      return <LoadingView />;
    } else {
      return <ErrorView />;
    }
  }

  // `/plus?referrals`: create-link gate (invalid popup if ineligible). An upgradeable member's Join
  // CTA buys an upgrade, not the subscription they hold.
  const referralCtaProduct = robloxAvailableProducts?.[0] ?? robloxSubscriptionProduct;
  if (isReferralsDashboard) {
    return (
      <PlusReferralDashboard
        robloxPlusUserBenefits={robloxPlusUserBenefitsQuery.data}
        subscribeButtonProps={{
          productId: referralCtaProduct.productKey.id,
          productType: referralCtaProduct.productKey.type,
          deviceMeta,
          // Same policy `PurchaseView` honours: without this the invalid sheet offers a live
          // Join CTA on surfaces where Blackbird entrypoints are turned off.
          isDisabled: isEntrypointDisabled,
          onMobilePurchaseInitiated,
        }}
        onClose={dismissReferralsDashboard}
      />
    );
  }

  if (hasMembership) {
    return (
      <SubscriberView
        deviceMeta={deviceMeta}
        isEntrypointDisabled={isEntrypointDisabled}
        isFaeFreeTrial={faeTrialCheckQuery.data === true}
        robloxPlusUserBenefits={robloxPlusUserBenefitsQuery.data}
        robloxSubscriptionMembership={robloxSubscriptionMembership}
        robloxSubscriptionProduct={robloxSubscriptionProduct}
        shouldDeeplinkToReferral={shouldDeeplinkToReferral}
        // The upgrade banner prices the plan per month.
        upgradeProduct={robloxAvailableProducts?.find(product => getProductMonths(product) === 1)}
        onMobilePurchaseInitiated={onMobilePurchaseInitiated}
        onOpenReferrals={enableReferralsDashboard}
      />
    );
  }

  // Not subscribed: the available-products list drives PurchaseView (and the bundle picker).
  if (!robloxAvailableProducts) {
    return <LoadingView />;
  }

  return (
    <PurchaseView
      deviceMeta={deviceMeta}
      isEntrypointDisabled={isEntrypointDisabled}
      robloxSubscriptionProducts={robloxAvailableProducts}
      onMobilePurchaseInitiated={onMobilePurchaseInitiated}
    />
  );
};

export default Content;
