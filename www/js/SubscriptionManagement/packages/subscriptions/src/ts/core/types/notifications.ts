export enum SubscriptionNotification {
  LOW_BALANCE_WARNING = 'LowBalanceWarning',
  LOW_BALANCE_GRACE_PERIOD = 'LowBalanceGracePeriod'
}

export const GetLowBalanceNotificationType = (
  showLowBalanceNotification: boolean,
  renewal: Date,
  expiration: Date
): SubscriptionNotification | null => {
  if (!showLowBalanceNotification) {
    return null;
  }

  const now = new Date();

  if (renewal < now && now < expiration) {
    return SubscriptionNotification.LOW_BALANCE_GRACE_PERIOD;
  }

  return SubscriptionNotification.LOW_BALANCE_WARNING;
};

export const SubscriptionNotificationIconClass: Record<SubscriptionNotification, string> = {
  [SubscriptionNotification.LOW_BALANCE_WARNING]: 'icon-status-alert',
  [SubscriptionNotification.LOW_BALANCE_GRACE_PERIOD]: 'icon-warning'
};

export default { SubscriptionNotification, GetLowBalanceNotificationType };
