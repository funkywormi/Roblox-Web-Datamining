import { useEffect, useState } from "react";
import { getCurrencyTransferEligibility } from "../services/tradesApi";
import type { CurrencyTransferEligibility } from "../types";

export type CurrencyTransfer = {
  /** False until the answer is known, so nothing is locked or blocked yet. */
  isLoaded: boolean;
  /** Viewer may attach Robux (they have Plus). Independent of `canRequest`. */
  canSend: boolean;
  /** Partner may attach Robux (they have Plus). Independent of `canSend`. */
  canRequest: boolean;
};

/**
 * Robux-in-trade permissions for a specific pairing, from
 * `/v2/users/{partnerId}/can-trade-with`.
 *
 * Read from there rather than `can-trade`, whose copy of these fields cannot
 * see the partner and so cannot say whether *they* may attach Robux. It is also
 * the server's own answer either way, so it replaces reading membership off the
 * page (`isBlackbirdUser`), which is empty on some pages and therefore
 * misreports members as non-members.
 *
 * Both directions default to allowed until the response lands, and stay allowed
 * if the field is missing or the request fails: the send is still validated
 * server side, and error 30 reports a rejected Robux request.
 */
export const useCurrencyTransfer = (partnerId: number | null | undefined): CurrencyTransfer => {
  // `undefined` while there is no partner yet or the request is in flight,
  // `null` once it is known that the response carried no eligibility.
  const [eligibility, setEligibility] = useState<CurrencyTransferEligibility | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (partnerId == null || partnerId <= 0) {
      return undefined;
    }

    let isActive = true;

    getCurrencyTransferEligibility(partnerId)
      .then(response => {
        if (isActive) {
          setEligibility(response);
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
  }, [partnerId]);

  return {
    isLoaded: eligibility !== undefined,
    canSend: eligibility?.canSend ?? true,
    canRequest: eligibility?.canRequest ?? true,
  };
};

export default useCurrencyTransfer;
