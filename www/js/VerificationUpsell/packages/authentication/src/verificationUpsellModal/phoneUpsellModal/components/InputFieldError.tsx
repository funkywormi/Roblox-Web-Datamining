import React from "react";
import type { Translator } from "@rbx/www-common/i18n";
import usePhoneUpsellState from "../hooks/usePhoneUpsellState";

function InputFieldError({ translate }: { translate: Translator<"Feature.VerificationUpsell"> }) {
  const { phoneUpsellState } = usePhoneUpsellState();
  return (
    <div className="phone-upsell-error-text text-body-small content-system-alert">
      {phoneUpsellState.errorMessage ? translate.dynamic(phoneUpsellState.errorMessage) : null}
    </div>
  );
}

export default InputFieldError;
