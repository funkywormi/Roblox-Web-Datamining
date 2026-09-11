import { GrantType, PeriodType, ProductType } from "@rbx/client-subscriptions-api/v1";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { isReferralEnabled } from "@rbx/core-scripts/meta/subscription";
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
import { sortProductsByAllowanceAscending } from "../utils/subscriptionProductInfo";

type AppPolicyResponse = {
  DisableBlackbirdEntrypoints?: boolean;
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
      });
      const subscription = subscriptions[0];
      if (!subscription) {
        return null;
      }
      return subscription;
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

  // Product info is sourced from the user's active subscription when subscribed; otherwise it
  // comes from the available-products list (bundles included so the picker has all tiers).
  // This avoids a redundant GetSubscriptionProductInfo call for subscribed users.
  const robloxAvailableProductsQuery = useQuery({
    queryKey: ["list-roblox-subscription-available-products"],
    queryFn: async () => {
      const { products } =
        await subscriptionsV2Api.subscriptionsV2ListAvailableSubscriptionProducts({
          productType: ProductType.Blackbird,
          includePurchased: true,
          includeBundles: true,
          skipEligibilityCheck: true,
        });
      if (products.length === 0) {
        return null;
      }
      return sortProductsByAllowanceAscending(products);
    },
    enabled: robloxSubscriptionMembershipQuery.data === null,
    retry: 3,
    retryDelay: 100,
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

  const isEntrypointDisabledQuery = useQuery({
    queryKey: ["guac/app-policy/disable-blackbird-entrypoints"],
    queryFn: async (): Promise<boolean> => {
      try {
        const data = await callBehaviour<AppPolicyResponse>("app-policy");
        return data.DisableBlackbirdEntrypoints === true;
      } catch {
        return false;
      }
    },
    retry: 3,
    retryDelay: 100,
    staleTime: Infinity,
  });

  const isEntrypointDisabled = useLatest(
    isEntrypointDisabledQuery.data,
    () => isEntrypointDisabledQuery.data !== undefined,
  );

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

  // When membership is detected during polling, show the appropriate view
  useEffect(() => {
    if (!isPollingForMembership || !robloxSubscriptionMembershipQuery.data) {
      return;
    }

    setIsPollingForMembership(false);
    if (!isFreeTrialConfirmation) {
      enableWelcome();
    }
  }, [
    enableWelcome,
    isFreeTrialConfirmation,
    isPollingForMembership,
    robloxSubscriptionMembershipQuery.data,
  ]);

  const onMobilePurchaseInitiated = useCallback(() => {
    setIsPollingForMembership(true);
  }, []);

  if (
    robloxAvailableProductsQuery.error ||
    robloxAvailableProductsQuery.data === null ||
    (robloxSubscriptionMembershipQuery.error && !isPollingForMembership) ||
    isEntrypointDisabledQuery.error ||
    !deviceMeta
  ) {
    return <ErrorView />;
  }

  if (
    robloxSubscriptionProduct === undefined ||
    robloxSubscriptionMembership === undefined ||
    isEntrypointDisabled === undefined
  ) {
    return <LoadingView />;
  }

  const isSubscribed = robloxSubscriptionMembership !== null;

  if (isFreeTrialConfirmation) {
    // Wait for the grant to propagate. The membership poll keeps retrying until the subscription
    // is visible (or the poll times out), so we show loading rather than erroring during the wait.
    if (!isSubscribed) {
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

  // `/plus?referrals`: create-link gate (invalid popup if ineligible).
  if (isReferralsDashboard) {
    return (
      <PlusReferralDashboard
        robloxPlusUserBenefits={robloxPlusUserBenefitsQuery.data}
        subscribeButtonProps={{
          productId: robloxSubscriptionProduct.productKey.id,
          productType: robloxSubscriptionProduct.productKey.type,
          deviceMeta,
          // Same policy `PurchaseView` honours: without this the invalid sheet offers a live
          // Join CTA on surfaces where Blackbird entrypoints are turned off.
          isDisabled: isEntrypointDisabled,
        }}
        onClose={dismissReferralsDashboard}
      />
    );
  }

  if (isSubscribed) {
    return (
      <SubscriberView
        isFaeFreeTrial={faeTrialCheckQuery.data === true}
        robloxPlusUserBenefits={robloxPlusUserBenefitsQuery.data}
        robloxSubscriptionMembership={robloxSubscriptionMembership}
        robloxSubscriptionProduct={robloxSubscriptionProduct}
        onOpenReferrals={enableReferralsDashboard}
      />
    );
  }

  // Not subscribed: the available-products list drives PurchaseView (and the bundle picker).
  // robloxSubscriptionProduct above guarantees the list has resolved when we reach this point.
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
