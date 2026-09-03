import React from "react";
import { savedPaymentMethodsEntryPointId } from "../constants/browserConstants";
import { renderPaymentsTab } from "../userSettingsEntry";

export const PaymentMethodSettingsContainer = (): JSX.Element => {
  renderPaymentsTab();
  return <div id={savedPaymentMethodsEntryPointId} />;
};

export default PaymentMethodSettingsContainer;
