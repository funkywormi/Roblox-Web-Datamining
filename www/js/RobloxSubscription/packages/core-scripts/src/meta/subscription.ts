const subscriptionReferralDataset = (): DOMStringMap | null => {
  const metaTag = document.querySelector<HTMLMetaElement>(
    'meta[name="subscription-referral-data"]',
  );
  return metaTag?.dataset ?? null;
};

/**
 * Roblox Plus referral rollout. The server only emits this tag when the Plus rollout is also on,
 * so this does not need to be combined with {@link isEnabled}.
 */
export const isReferralEnabled = (): boolean => subscriptionReferralDataset()?.isEnabled === "true";
