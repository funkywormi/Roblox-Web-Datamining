import { createContext } from "react";
import { Modals } from "../hooks/useModals";

export const ModalContext = createContext<Modals>({
  purchaseDisabled: {
    closeModal: () => undefined,
    hasUserDisabledPurchases: false,
    isOpen: false,
    openModal: () => undefined,
    showVPCOptimization: false,
  },
  purchaseWarning: {
    action: undefined,
    closeModal: () => undefined,
    continuePurchase: () => undefined,
    isOpen: false,
    openModal: () => undefined,
  },
  quickPay: {
    closeModal: () => undefined,
    isOpen: false,
    openModal: () => undefined,
  },
  quickPay3DS: {
    closeModal: () => undefined,
    isOpen: false,
    openModal: () => undefined,
    url: "",
  },
  robuxGifting: {
    closeModal: () => undefined,
    isOpen: false,
    openModal: () => undefined,
  },
  redirectError: {
    closeModal: () => undefined,
    isOpen: false,
    openModal: () => undefined,
  },
  samsungPaymentMethods: {
    closeModal: () => undefined,
    isBonus: false,
    isOpen: false,
    isSubscription: false,
    openModal: () => undefined,
    product: undefined,
  },
  firstTimePurchaseConsent: {
    closeModal: () => undefined,
    continuePurchase: undefined,
    isOpen: false,
    openModal: () => undefined,
  },
});
