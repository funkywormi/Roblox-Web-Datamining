/** Query key that lets an employee pick the `/support` experience. Not linked from production. */
export const SUPPORT_UI_PROTOTYPE_QUERY_PARAM = "rbxSupportUi";

/** `prototype` is the ask prototype; `classic` is the support form. */
export type SupportUiChoice = "prototype" | "classic";

/**
 * Sitetest preview of the new landing. It is not a stored choice, so opening it does not
 * replace the ask prototype. Remove the prototype once this landing is ready to take its place.
 */
const SUPPORT_UI_LANDING_PREVIEW = "landing";

/**
 * Opens the regular support form and skips the landing and the sign-in gate. A failed
 * conversation would otherwise land back on one of those. This value is not stored, and like
 * the landing preview it only applies outside production.
 */
const SUPPORT_UI_REGULAR_FORM = "form";

const SUPPORT_UI_CHOICE_STORAGE_KEY = "RobloxSupportUiChoice";

const isSupportUiChoice = (value: unknown): value is SupportUiChoice =>
  value === "prototype" || value === "classic";

const getSupportUiFromUrl = (search: string): string | null =>
  new URLSearchParams(search).get(SUPPORT_UI_PROTOTYPE_QUERY_PARAM);

export const isSupportLandingPreviewUrl = (search: string): boolean =>
  getSupportUiFromUrl(search) === SUPPORT_UI_LANDING_PREVIEW;

export const isSupportRegularFormUrl = (search: string): boolean =>
  getSupportUiFromUrl(search) === SUPPORT_UI_REGULAR_FORM;

/** `search` with the experience switched to the regular form. Other parameters, such as the Help Center article the ticket is attributed to, are kept. */
export const regularSupportFormSearch = (search: string): string => {
  const params = new URLSearchParams(search);
  params.set(SUPPORT_UI_PROTOTYPE_QUERY_PARAM, SUPPORT_UI_REGULAR_FORM);
  return `?${params.toString()}`;
};

export const getSupportUiChoiceFromUrl = (search: string): SupportUiChoice | undefined => {
  const value = getSupportUiFromUrl(search);
  return isSupportUiChoice(value) ? value : undefined;
};

export const getStoredSupportUiChoice = (): SupportUiChoice | undefined => {
  const value = localStorage.getItem(SUPPORT_UI_CHOICE_STORAGE_KEY);
  return isSupportUiChoice(value) ? value : undefined;
};

export const storeSupportUiChoice = (choice: SupportUiChoice): void => {
  localStorage.setItem(SUPPORT_UI_CHOICE_STORAGE_KEY, choice);
};
