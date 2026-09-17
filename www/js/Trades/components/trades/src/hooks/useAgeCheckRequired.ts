import { useEffect, useState } from "react";
import { canTrade, isAgeCheckEligibility } from "../services/tradesApi";

export type AgeCheckRequirement = {
  /** False until the answer is known, so nothing is gated on a guess. */
  isLoaded: boolean;
  /** The viewer must pass the age check before any trade of theirs will send. */
  isRequired: boolean;
};

/**
 * Whether `/v2/users/me/can-trade` reports the viewer as age-check ineligible.
 *
 * These viewers reach the builder at all because openNewTrade treats
 * SenderAgeCheckRequired (and the older collapsed SenderCannotTrade shape) as
 * stay-on-builder, so the check is offered on send rather than as a 403.
 *
 * Unknown eligibility never gates: the send is validated server side, and error
 * 7 opens the same prompt.
 */
export const useAgeCheckRequired = (): AgeCheckRequirement => {
  // `undefined` while the request is in flight, `null` once it is known that no
  // eligibility could be read.
  const [eligibility, setEligibility] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let isActive = true;

    canTrade()
      .then(response => {
        if (isActive) {
          setEligibility(response?.tradeEligibility ?? null);
        }
      })
      .catch(() => {
        if (isActive) {
          setEligibility(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return {
    isLoaded: eligibility !== undefined,
    isRequired: isAgeCheckEligibility(eligibility),
  };
};

export default useAgeCheckRequired;
