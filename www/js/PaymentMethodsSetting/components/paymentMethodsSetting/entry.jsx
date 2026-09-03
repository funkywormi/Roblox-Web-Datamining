import Roblox from 'Roblox';
import { renderWithErrorBoundary } from '@rbx/core-scripts/react';
import App from '@rbx/payments/src/migration/paymentMethodsSetting/App';
import './src/main.css';

export const renderComponent = (containerId) => {
  const rootElement = document.getElementById(containerId);
  if (rootElement !== null) {
    renderWithErrorBoundary(<App />, rootElement);
    return true;
  }
  return false;
};

const PaymentSetting = {
  renderComponent
};

Object.assign(Roblox, {
  PaymentSetting
});
