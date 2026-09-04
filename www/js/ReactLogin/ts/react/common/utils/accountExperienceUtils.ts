/**
 * Check if we're on the landing page based on the page-meta tag.
 * @returns {boolean}
 */
const isLandingPage = (): boolean => {
  const pageMetaTag = document.querySelector<HTMLElement>('meta[name="page-meta"]');
  return pageMetaTag?.dataset?.internalPageName === 'Landing';
};

/**
 * Check if the user is signing up as a parent (via Verified Parental Consent).
 * This is indicated by the presence of a dataToken URL parameter.
 * @returns {boolean}
 */
const isParentalSignup = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return !!urlParams.get('dataToken');
};

/**
 * Check if the account experience revamp is enabled for the current user.
 * The revamped flow is not live and has no planned launch. Unless a task explicitly
 * targets the revamp, treat the non-revamped flow as the production source of truth.
 * @returns {boolean}
 */
const isAccountExperienceRevampEnabled = (): boolean => {
  // Parental signup on landing page should fall back to non-revamped signup form
  if (isLandingPage() && isParentalSignup()) {
    return false;
  }

  const metaTag = document.querySelector<HTMLElement>(
    'meta[name="account-experience-revamp-data"]'
  );
  const keyMap = metaTag?.dataset ?? {};
  return keyMap.isAccountExperienceRevampEnabled === 'true';
};

export default isAccountExperienceRevampEnabled;
