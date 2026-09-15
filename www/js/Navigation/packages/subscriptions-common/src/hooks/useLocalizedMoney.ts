import { useTranslation } from "@rbx/core-scripts/react";
import { useMemo } from "react";

import type { Money } from "@rbx/client-subscriptions-api/v1";

const useLocalizedMoney = (money: Money, options?: Intl.NumberFormatOptions) => {
  const { intl } = useTranslation();

  return useMemo(() => {
    const amount = money.units + money.nanos * 1e-9;
    return intl.n(amount, {
      style: "currency",
      currency: money.currencyCode,
      ...options,
    });
  }, [intl, money, options]);
};

export default useLocalizedMoney;
