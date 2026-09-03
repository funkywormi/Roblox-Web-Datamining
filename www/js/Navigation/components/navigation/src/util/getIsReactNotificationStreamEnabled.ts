export const getIsReactNotificationStreamEnabled = (): boolean => {
  const dataset = document.querySelector<HTMLMetaElement>(
    'meta[name="notification-stream-migration-data"]',
  )?.dataset;
  return dataset?.reactStreamEnabled === "True";
};
