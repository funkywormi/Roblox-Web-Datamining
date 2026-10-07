import { useFormatter } from "@rbx/www-common/intl";
import { useMemo } from "react";

import type { Money } from "@rbx/client-subscriptions-api/v2";

const useLocalizedMoney = (money: Money, options?: Intl.NumberFormatOptions) => {
  const format = useFormatter();

  return useMemo(() => {
    const amount = money.units + money.nanos * 1e-9;
    return format.number(amount, {
      style: "currency",
      currency: money.currencyCode,
      ...options,
    });
  }, [format, money, options]);
};

export default useLocalizedMoney;
