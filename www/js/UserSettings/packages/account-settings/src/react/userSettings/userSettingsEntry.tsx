import {
  SecurityTab,
  PaymentSetting,
  SubscriptionManagement,
  NotificationPreferencesService,
} from "Roblox";
import App from "./App";
import {
  userSettingsPageContainer,
  securityTabContainer,
  securityTabEntryPointId,
  savedPaymentMethodsContainer,
  savedPaymentMethodsEntryPointId,
  subscriptionManagementContainer,
  subscriptionManagementEntryPointId,
  notificationsTabContainer,
} from "./constants/browserConstants";
import "../../userSettings-css/userSettings.scss";
import "../../userSettings-css/utilities/tailwind.css";
import Providers from "../common/providers";
import { setupResizeObserverPolyfill } from "../common/utils/resizeObserverPolyfill";
import { renderWithErrorBoundary } from "react-utilities";

// Setup ResizeObserver polyfill for UWP compatibility before any components are rendered
setupResizeObserverPolyfill();

export const renderApp = (): void => {
  const entryPoint = userSettingsPageContainer();
  renderWithErrorBoundary(
    <Providers>
      <App />
    </Providers>,
    entryPoint,
  );
};

export const renderSecurityTab = (): void => {
  const securityTabEntryPoint = securityTabContainer();
  if (securityTabEntryPoint) {
    SecurityTab.renderComponent(securityTabEntryPointId);
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(renderSecurityTab);
  }
};

export const renderPaymentsTab = (): void => {
  const savedPaymentMethodsEntryPoint = savedPaymentMethodsContainer();
  if (savedPaymentMethodsEntryPoint) {
    PaymentSetting.renderComponent(savedPaymentMethodsEntryPointId);
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(renderPaymentsTab);
  }
};

export const renderSubscriptionsTab = (): void => {
  const subscriptionsTabEntryPoint = subscriptionManagementContainer();
  if (subscriptionsTabEntryPoint) {
    SubscriptionManagement.renderComponent(subscriptionManagementEntryPointId);
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(renderSubscriptionsTab);
  }
};

export const renderNotificationsTab = (): void => {
  const notificationsTabEntryPoint = notificationsTabContainer();
  if (notificationsTabEntryPoint) {
    NotificationPreferencesService.renderNotificationPreferences(notificationsTabEntryPoint);
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(renderNotificationsTab);
  }
};
