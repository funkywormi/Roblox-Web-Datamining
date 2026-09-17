import { useEffect, useState } from "react";
import { isBlackbirdUser } from "@rbx/core-scripts/meta/user";
import { canTrade, subscribeCanTrade } from "../services/tradesApi";
import type { CanTradeResponse, FreeTradesAllowance } from "../types";
import { isCappedByFreeTrades, isSpentFreeTradesAllowance } from "../utils/tradesUtils";

export type TradeQuota = {
  /** False until the allowance is known, so the quota banner stays hidden until then. */
  isLoaded: boolean;
  /** Completed trades still available in the current window. */
  remaining: number;
  /** The allowance the remaining count counts down from. */
  total: number;
  /** Period the allowance resets on, which decides how the counter is worded. */
  window: string;
  /** Whether the free-trade remaining counter should be shown. */
  shouldShowQuota: boolean;
  /** Whether the list-page Plus pitch should be shown (dismiss is handled by the list). */
  shouldShowUpsell: boolean;
  /**
   * The allowance is spent, so sending and accepting should be blocked in favour
   * of the Plus upsell. False until the allowance loads, so an unknown quota
   * never blocks a trade — the server is still the authority.
   */
  isOutOfTrades: boolean;
};

/**
 * Free-trade allowance plus the list-page Plus pitch.
 *
 * `/v2/users/me/can-trade` omits the allowance when none caps the user, which
 * hides the remaining-trades counter. The Plus card is independent of that cap
 * and is shown to every non-member.
 */
export const useTradeQuota = (): TradeQuota => {
  // `undefined` while the request is in flight, `null` once it is known that no
  // allowance applies.
  const [allowance, setAllowance] = useState<FreeTradesAllowance | null | undefined>(undefined);

  useEffect(() => {
    let isActive = true;

    const apply = (response: CanTradeResponse | null) => {
      if (isActive) {
        setAllowance(response?.freeTradesAllowance ?? null);
      }
    };

    canTrade()
      .then(apply)
      .catch(() => {
        apply(null);
      });

    const unsubscribe = subscribeCanTrade(apply);

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const isCapped = isCappedByFreeTrades(allowance);
  // Plus already includes unlimited trades, so neither the remaining-trades
  // counter, the list-page pitch, nor the out-of-trades sheet should fire for a
  // member — even if the allowance endpoint still reports a cap.
  const isPlus = isBlackbirdUser();

  return {
    isLoaded: allowance !== undefined,
    remaining: allowance?.remaining ?? 0,
    total: allowance?.limit ?? 0,
    window: allowance?.window ?? "",
    shouldShowQuota: isCapped && !isPlus,
    shouldShowUpsell: !isPlus,
    isOutOfTrades: isSpentFreeTradesAllowance(allowance) && !isPlus,
  };
};

export default useTradeQuota;
