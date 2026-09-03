import { useCallback, useEffect, useState } from "react";
// prettier-ignore
// @ts-expect-error - Legacy Roblox module types
import { EmailVerificationService } from "@rbx/core-scripts/legacy/Roblox";

export const DATASET_ELEMENT_ID = "robux-container-base";

export function useEmailVerification(): {
  isVerificationUpsellEnabled: boolean;
  verifyEmail: (
    isSubscriptionProduct: boolean,
  ) => (param: () => void) => Promise<Record<string, unknown>>;
} {
  const [isVerificationUpsellEnabled, setIsVerificationUpsellEnabled] = useState<boolean>(false);

  useEffect(() => {
    const rootDataset = document.getElementById(DATASET_ELEMENT_ID)?.dataset;

    if (rootDataset) {
      setIsVerificationUpsellEnabled(rootDataset.isVerificationUpsellEnabled === "true");
    }
  }, []);

  const verifyEmail = useCallback(
    (isSubscriptionProduct: boolean): ((param: () => void) => Promise<Record<string, unknown>>) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      isSubscriptionProduct
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          EmailVerificationService?.handleUserEmailUpsellAtPremiumSubscription
        : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          EmailVerificationService?.handleUserEmailUpsellAtBuyRobux,
    [],
  );

  return {
    isVerificationUpsellEnabled,
    verifyEmail,
  };
}
