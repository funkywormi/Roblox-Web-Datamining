import { useCallback, useContext, useState } from "react";
import { UrlSearchParams } from "@rbx/core-lib/url";
import { Modals } from "../useModals";
import { TrackingContext } from "../../contexts/TrackingContext";

export type SamsungPaymentMethods = {
  handleClose: () => void;
  handleSamsungPayClick: () => void;
  handleRedeemCreditClick: () => void;
  markRedirectHandled: () => void;
  shouldRedirectToPurchase: boolean;
};

export function useSamsungPaymentMethods({
  samsungPaymentMethods: { closeModal, product },
}: Modals): SamsungPaymentMethods {
  const {
    trackSamsungPaymentMethodsCancel,
    trackSamsungPaymentMethodsRedeemCreditClick,
    trackSamsungPaymentMethodsSamsungPayClick,
  } = useContext(TrackingContext);

  const [shouldRedirectToPurchase, setShouldRedirectToPurchase] = useState<boolean>(false);

  const handleSamsungPayClick = useCallback(() => {
    trackSamsungPaymentMethodsSamsungPayClick();

    setShouldRedirectToPurchase(true);
    closeModal();
  }, [trackSamsungPaymentMethodsSamsungPayClick, closeModal]);

  const handleRedeemCreditClick = useCallback(() => {
    trackSamsungPaymentMethodsRedeemCreditClick();

    window.location.href = `/upgrades/redeem?${UrlSearchParams.new({
      ap: product?.productId ?? "",
      pm: "redeemCard",
    }).toString()}`;

    closeModal();
  }, [trackSamsungPaymentMethodsRedeemCreditClick, product, closeModal]);

  const handleClose = useCallback(() => {
    trackSamsungPaymentMethodsCancel();
    closeModal();
  }, [trackSamsungPaymentMethodsCancel, closeModal]);

  const markRedirectHandled = useCallback(() => {
    setShouldRedirectToPurchase(false);
  }, []);

  return {
    handleClose,
    handleRedeemCreditClick,
    handleSamsungPayClick,
    markRedirectHandled,
    shouldRedirectToPurchase,
  };
}
