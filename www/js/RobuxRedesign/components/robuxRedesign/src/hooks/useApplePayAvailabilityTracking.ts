/* eslint-disable no-void */
import { useEffect, useState } from "react";
import { trackError } from "../observability";

// https://developer.apple.com/documentation/applepayontheweb/checking-for-apple-pay-availability

export type ApplePaySession = {
  canMakePayments: () => boolean;
  canMakePaymentsWithActiveCard: (merchantIdentifier: string) => Promise<boolean | undefined>;
};

const ROBLOX_APPLE_PAY_MERCHANT_IDENTIFIER = window.location.href.includes("sitetest1")
  ? "merchant.sitetest1.robloxlabs.com.stripe"
  : "merchant.www.roblox.com.stripe";

export function useApplePayAvailabilityTracking(): boolean | undefined {
  const [applePayAvailability, setApplePayAvailability] = useState<boolean>();

  useEffect(() => {
    const fetchApplePayAvailability = async () => {
      try {
        const { ApplePaySession } = window;

        if (!ApplePaySession?.canMakePayments()) {
          setApplePayAvailability(false);
          return;
        }

        const canMakePaymentsWithApplePay = await ApplePaySession.canMakePaymentsWithActiveCard(
          ROBLOX_APPLE_PAY_MERCHANT_IDENTIFIER,
        );

        setApplePayAvailability(Boolean(canMakePaymentsWithApplePay));
      } catch (e) {
        trackError("ApplePayAvailabilityException", null, e);
        setApplePayAvailability(false);
      }
    };

    void fetchApplePayAvailability();
  }, []);

  return applePayAvailability;
}
