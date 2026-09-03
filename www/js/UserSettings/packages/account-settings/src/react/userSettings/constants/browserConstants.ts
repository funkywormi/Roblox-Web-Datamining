const userSettingsContainerId = "react-user-account-base";
export const userSettingsPageContainer = (): HTMLElement | null =>
  document.getElementById(userSettingsContainerId);

// Security
export const securityTabEntryPointId = "security-tab";
export const securityTabContainer = (): HTMLElement | null =>
  document.getElementById(securityTabEntryPointId);

// Notifications
export const notificationsTabEntryPointId = "notifications-settings-tab";
export const notificationsTabContainer = (): HTMLElement | null =>
  document.getElementById(notificationsTabEntryPointId);

// Billing
export const savedPaymentMethodsEntryPointId = "billing-react-app-container";
export const savedPaymentMethodsContainer = (): HTMLElement | null =>
  document.getElementById(savedPaymentMethodsEntryPointId);

// Subscriptions
export const subscriptionManagementEntryPointId = "subscription-management-container";
export const subscriptionManagementContainer = (): HTMLElement | null =>
  document.getElementById(subscriptionManagementEntryPointId);

// Robux
export const robuxManagementEntryPointId = "robux-management-container";
export const robuxManagementContainer = (): HTMLElement | null =>
  document.getElementById(robuxManagementEntryPointId);

// Body element
export const bodyElementId = "rbx-body";
