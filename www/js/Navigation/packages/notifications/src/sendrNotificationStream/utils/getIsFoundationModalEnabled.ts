// Reads the UBIQUITY-3143 rollout flag emitted by the website (see
// SendrNotificationStreamMetaTag.cshtml). Razor renders a C# bool as
// "True"/"False", so compare against "True" per the repo convention.
export const getIsFoundationModalEnabled = (): boolean => {
  const dataset = document.querySelector<HTMLMetaElement>(
    'meta[name="sendr-notification-stream-data"]',
  )?.dataset;
  return dataset?.isFoundationModalEnabled === "True";
};

export default getIsFoundationModalEnabled;
