import { window } from "@rbx/core-lib/browser";
import { ACCOUNT_SECURITY_DISPLAY_EPP, ACCOUNT_SECURITY_DISPLAY_QUERY } from "../../../common/urls";

/**
 * Returns the `display` query param, which may appear either in the page query string
 * (`/my/account?display=...#!/security`) or after the hash route (`/my/account#!/security?display=...`).
 */
export const getDisplayParam = (): string | null => {
  if (!window) {
    return null;
  }
  const { search, hash } = window.location;
  const hashQueryIndex = hash.indexOf("?");
  const hashSearch = hashQueryIndex === -1 ? "" : hash.slice(hashQueryIndex);

  return (
    new URLSearchParams(search).get(ACCOUNT_SECURITY_DISPLAY_QUERY) ??
    new URLSearchParams(hashSearch).get(ACCOUNT_SECURITY_DISPLAY_QUERY)
  );
};

export const isEppDisplayRequested = (): boolean =>
  getDisplayParam() === ACCOUNT_SECURITY_DISPLAY_EPP;
