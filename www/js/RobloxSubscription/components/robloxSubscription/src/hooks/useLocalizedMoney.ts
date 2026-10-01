import { useTranslation } from "@rbx/core-scripts/react";
import { getPrice } from "@rbx/payments/services/subscriptions";
import { useMemo } from "react";

import type { Money } from "@rbx/client-roblox-subscriptions-api/v1";

function useLocalizedMoney(money: Money, options?: Intl.NumberFormatOptions): string;
function useLocalizedMoney(
  money: Money | null | undefined,
  options?: Intl.NumberFormatOptions,
): string | undefined;
function useLocalizedMoney(money: Money | null | undefined, options?: Intl.NumberFormatOptions) {
  const { intl } = useTranslation();

  return useMemo(() => {
    if (!money) {
      return undefined;
    }
    return intl.n(getPrice(money), {
      style: "currency",
      currency: money.currencyCode,
      ...options,
    });
  }, [intl, money, options]);
}

export default useLocalizedMoney;
