/**
 * Reads the UBIQUITY-3158 rollout flag emitted by the website (see
 * NotificationStreamMigrationMetaTag.cshtml) that gates the notification bell/badge
 * on React vs the legacy AngularJS indicator directive. Razor renders a C# bool as
 * "True"/"False", so compare against "True".
 * @returns {boolean}
 */
export const getIsReactNotificationBellEnabled = (): boolean => {
  const dataset = document.querySelector<HTMLMetaElement>(
    'meta[name="notification-stream-migration-data"]',
  )?.dataset;
  return dataset?.reactBellEnabled === "True";
};
