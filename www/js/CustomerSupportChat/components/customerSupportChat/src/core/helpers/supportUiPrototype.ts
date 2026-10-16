/** Query key that lets an employee pick the `/support` experience. Not linked from production. */
export const SUPPORT_UI_PROTOTYPE_QUERY_PARAM = "rbxSupportUi";

/** `prototype` is the new support experience; `classic` is the support form. */
export type SupportUiChoice = "prototype" | "classic";

const SUPPORT_UI_CHOICE_STORAGE_KEY = "RobloxSupportUiChoice";

const isSupportUiChoice = (value: unknown): value is SupportUiChoice =>
  value === "prototype" || value === "classic";

export const getSupportUiChoiceFromUrl = (search: string): SupportUiChoice | undefined => {
  const value = new URLSearchParams(search).get(SUPPORT_UI_PROTOTYPE_QUERY_PARAM);
  return isSupportUiChoice(value) ? value : undefined;
};

export const getStoredSupportUiChoice = (): SupportUiChoice | undefined => {
  const value = localStorage.getItem(SUPPORT_UI_CHOICE_STORAGE_KEY);
  return isSupportUiChoice(value) ? value : undefined;
};

export const storeSupportUiChoice = (choice: SupportUiChoice): void => {
  localStorage.setItem(SUPPORT_UI_CHOICE_STORAGE_KEY, choice);
};
