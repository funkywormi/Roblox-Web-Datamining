import { Money as ProviderPayloadMoney } from "../services/paymentsGatewayService";
import { Money } from "../types/buyRobuxPageData";

export function formatAmount(money: Money): string {
  return (Number(money.units ?? "0") + (money.nanos ?? 0) / 1e9).toString();
}

export const convertProviderPayloadMoneyToDecimal = ({
  Nanos: nanos,
  Units: units,
}: ProviderPayloadMoney): number => {
  const totalAmount = units + nanos / 1e9;
  return parseFloat(totalAmount.toFixed(2));
};
