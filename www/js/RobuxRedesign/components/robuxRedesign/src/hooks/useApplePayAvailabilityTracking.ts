/* eslint-disable no-void */
import { useEffect, useState } from "react";
import { window } from "@rbx/core-lib/browser";
import { trackError } from "../observability";

// https://developer.apple.com/documentation/applepayontheweb/checking-for-apple-pay-availability

export type ApplePaySession = {
  canMakePayments: () => boolean;
  canMakePaymentsWithActiveCard: (merchantIdentifier: string) => Promise<boolean | undefined>;
};

export function useApplePayAvailabilityTracking(): boolean | undefined {
  const [applePayAvailability, setApplePayAvailability] = useState<boolean>();

  useEffect(() => {
    if (window === undefined) {
      return;
    }

    const merchantIdentifier = window.location.href.includes("sitetest1")
      ? "merchant.sitetest1.robloxlabs.com.stripe"
      : "merchant.www.roblox.com.stripe";
    const { ApplePaySession } = window;

    const fetchApplePayAvailability = async () => {
      try {
        if (!ApplePaySession?.canMakePayments()) {
          setApplePayAvailability(false);
          return;
        }

        const canMakePaymentsWithApplePay =
          await ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);

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
