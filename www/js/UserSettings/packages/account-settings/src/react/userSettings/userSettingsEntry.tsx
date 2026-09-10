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
import MagicLinkEntryAction from "../../enums/MagicLinkEntryAction";
import MagicLinkSwitchAccountModal from "./components/magicLink/MagicLinkSwitchAccountModal";
import { getMagicLinkToken, resolveMagicLinkEntryAction } from "./utils/magicLinkUtils";

// Setup ResizeObserver polyfill for UWP compatibility before any components are rendered
setupResizeObserverPolyfill();

const renderSettings = (content: JSX.Element): void => {
  renderWithErrorBoundary(<Providers>{content}</Providers>, userSettingsPageContainer());
};

export const renderApp = (): void => {
  // Parent emails link here with a `magicLinkToken` query param, e.g.
  // /my/account?magicLinkToken=...#!/parental-controls/LinkedChildDetails-123.
  if (!getMagicLinkToken()) {
    renderSettings(<App />);
    return;
  }

  resolveMagicLinkEntryAction()
    .then(action => {
      if (action === MagicLinkEntryAction.RedirectedToLogin) {
        return;
      }

      if (action === MagicLinkEntryAction.ShowSwitchAccountModal) {
        renderSettings(<MagicLinkSwitchAccountModal variant="valid" />);
        return;
      }
      if (action === MagicLinkEntryAction.ShowExpiredSwitchAccountModal) {
        renderSettings(<MagicLinkSwitchAccountModal variant="expired" />);
        return;
      }
      renderSettings(<App />);
    })
    .catch(() => {
      renderSettings(<App />);
    });
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
