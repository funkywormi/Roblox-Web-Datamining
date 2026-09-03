import { ReactNode } from "react";
import { PurchaseContext } from "../contexts/PurchaseContext";
import { usePurchase } from "../hooks/purchase/usePurchase";
import { QuickPay } from "../hooks/quickPay/useQuickPay";
import { SamsungPaymentMethods } from "../hooks/samsungPaymentMethods/useSamsungPaymentMethods";

export function PurchaseContainer({
  children,
  quickPay,
  samsungPaymentMethods,
}: {
  children: ReactNode;
  quickPay: QuickPay;
  samsungPaymentMethods: SamsungPaymentMethods;
}) {
  return (
    <PurchaseContext.Provider value={usePurchase(quickPay, samsungPaymentMethods)}>
      {children}
    </PurchaseContext.Provider>
  );
}
