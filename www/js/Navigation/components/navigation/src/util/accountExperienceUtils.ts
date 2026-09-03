/**
 * Check if the account experience revamp is enabled for the current browser and
 * page. This is meant for authentication related pages only.
 * @returns {boolean}
 */
export const isAccountExperienceRevampEnabled = (): boolean => {
  const metaTag = document.querySelector<HTMLElement>(
    'meta[name="account-experience-revamp-data"]',
  );
  const keyMap = metaTag?.dataset ?? {};
  return keyMap.isAccountExperienceRevampEnabled === "true";
};
