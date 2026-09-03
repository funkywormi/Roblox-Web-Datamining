import { ProductType } from "@rbx/client-subscriptions-api/v1";
import { Button } from "@rbx/foundation-ui";
import { useCallback, useMemo, useState } from "react";

import { saveSubscriptionRedirectUrl } from "../../utils/redirectUrl";

import type { DeviceMeta } from "@rbx/core-scripts/meta/device";
import type { TButtonSize, TButtonVariant } from "@rbx/foundation-ui";
import type { ReactNode } from "react";

export type SubscriptionButtonProps = {
  productType: string;
  productId: string;
  deviceMeta: DeviceMeta;
  variant?: TButtonVariant;
  size?: TButtonSize;
  className?: string;
  isDisabled?: boolean;
  redirectUrl?: string;
  paymentSessionId?: string;
  onSubscribeClick?: () => void;
  /**
   * Fired only on mobile in-app, just before the WebView intercepts the
   * navigation and opens the native purchase modal. The page stays mounted
   * during/after the native flow, so the parent should use this signal to
   * start polling for the new subscription state and refresh accordingly.
   */
  onMobilePurchaseInitiated?: () => void;
  /**
   * Externally controlled loading state. Pass `true` to force a spinner on
   * during async work the button cannot observe itself (e.g. polling for
   * entitlement after a mobile in-app native purchase). Pass `undefined`
   * (or omit) to defer to the internal click-driven spinner on web. Do not
   * pass an explicit `false` - that would silently suppress the internal
   * spinner. Use `loadingStateDisabled` if you need to fully suppress it.
   */
  isLoading?: boolean;
  children: ReactNode;
  trackSubscriptionButtonClick?: () => void;
  loadingStateDisabled?: boolean;
};

const SubscriptionButton = ({
  productType,
  productId,
  deviceMeta,
  variant = "Emphasis",
  size,
  className,
  isDisabled = false,
  redirectUrl,
  paymentSessionId,
  onSubscribeClick,
  onMobilePurchaseInitiated,
  isLoading: isLoadingProp,
  children,
  trackSubscriptionButtonClick,
  loadingStateDisabled = false,
}: SubscriptionButtonProps) => {
  const [isLoadingInternal, setIsLoadingInternal] = useState(false);
  const isMobileInApp = deviceMeta.isAndroidApp || deviceMeta.isIosApp;
  // Callers must pass `true` or `undefined` (never explicit `false`) for the
  // ?? fall-through to internal click-driven state to work.
  const effectiveIsLoading = isLoadingProp ?? isLoadingInternal;

  // The V2 API uses the legacy product-type identifier `Blackbird`, but we
  // surface the friendlier public-facing `RobloxPlus` alias in URLs the user
  // can see / share. Downstream consumers accept both.
  const urlProductType = productType === ProductType.Blackbird ? "RobloxPlus" : productType;

  const purchaseUrl = useMemo(() => {
    const path = isMobileInApp ? "/mobile-app-upgrades/buy" : "/upgrades/paymentmethods";
    const url = new URL(path, window.location.origin);
    url.searchParams.append("ctx", "subscription");
    url.searchParams.append("type", urlProductType);
    url.searchParams.append("id", productId);
    if (paymentSessionId) {
      url.searchParams.append("paymentSessionId", paymentSessionId);
    }
    if (!isMobileInApp && redirectUrl) {
      url.searchParams.append("redirectUrl", redirectUrl);
    }
    return url.toString();
  }, [isMobileInApp, urlProductType, productId, paymentSessionId, redirectUrl]);

  const onClick = useCallback(() => {
    if (isDisabled) {
      return;
    }

    trackSubscriptionButtonClick?.();
    if (redirectUrl) {
      saveSubscriptionRedirectUrl(redirectUrl);
    }
    onSubscribeClick?.();

    if (isMobileInApp) {
      // Page stays mounted while the native overlay opens on top. The internal
      // loading state would have nothing to time it out, so we leave it to the
      // parent to drive the spinner via the `isLoading` prop while it polls
      // for the new entitlement (started here via onMobilePurchaseInitiated).
      // SUBS-4712.
      onMobilePurchaseInitiated?.();
      return;
    }

    setIsLoadingInternal(true);
  }, [
    isDisabled,
    trackSubscriptionButtonClick,
    redirectUrl,
    onSubscribeClick,
    isMobileInApp,
    onMobilePurchaseInitiated,
  ]);

  return (
    <Button
      as="a"
      className={className}
      href={purchaseUrl}
      isDisabled={isDisabled}
      isLoading={loadingStateDisabled ? undefined : effectiveIsLoading}
      size={size}
      variant={variant}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default SubscriptionButton;
