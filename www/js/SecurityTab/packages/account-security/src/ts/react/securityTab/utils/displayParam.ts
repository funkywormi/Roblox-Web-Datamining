import { window } from "@rbx/core-lib/browser";
import {
  ACCOUNT_SECURITY_DISPLAY_EPP,
  ACCOUNT_SECURITY_DISPLAY_QUERY,
  ACCOUNT_SECURITY_DISPLAY_TWO_STEP_VERIFICATION,
} from "../../../common/urls";

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

export const isTwoStepVerificationDisplayRequested = (): boolean =>
  getDisplayParam() === ACCOUNT_SECURITY_DISPLAY_TWO_STEP_VERIFICATION;

/**
 * Sets the `display` query param after the hash route (`/my/account#!/security?display=...`), or
 * removes it when `value` is `null`. Any `display` in the page query string is removed so the hash
 * copy is the only one. Uses `replaceState`, which the hash router doesn't treat as a navigation.
 */
export const setDisplayParam = (value: string | null): void => {
  if (!window) {
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.delete(ACCOUNT_SECURITY_DISPLAY_QUERY);

  const hashQueryIndex = url.hash.indexOf("?");
  const hashPath = hashQueryIndex === -1 ? url.hash : url.hash.slice(0, hashQueryIndex);
  const hashParams = new URLSearchParams(
    hashQueryIndex === -1 ? "" : url.hash.slice(hashQueryIndex + 1),
  );
  if (value === null) {
    hashParams.delete(ACCOUNT_SECURITY_DISPLAY_QUERY);
  } else {
    hashParams.set(ACCOUNT_SECURITY_DISPLAY_QUERY, value);
  }
  const hashQuery = hashParams.toString();
  url.hash = hashQuery ? `${hashPath}?${hashQuery}` : hashPath;

  window.history.replaceState(window.history.state, "", url.toString());
};
