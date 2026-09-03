import { ReactNode } from "react";
import { ModalContainer } from "./ModalContainer";
import { PurchaseContainer } from "./PurchaseContainer";
import { useQuickPay } from "../hooks/quickPay/useQuickPay";
import { useModals } from "../hooks/useModals";
import { useSamsungPaymentMethods } from "../hooks/samsungPaymentMethods/useSamsungPaymentMethods";

export function PurchasingContainer({ children }: { children: ReactNode }) {
  const modals = useModals();
  const quickPay = useQuickPay(modals);
  const samsungPaymentMethods = useSamsungPaymentMethods(modals);

  return (
    <ModalContainer
      modals={modals}
      quickPay={quickPay}
      samsungPaymentMethods={samsungPaymentMethods}
    >
      <PurchaseContainer quickPay={quickPay} samsungPaymentMethods={samsungPaymentMethods}>
        {children}
      </PurchaseContainer>
    </ModalContainer>
  );
}
