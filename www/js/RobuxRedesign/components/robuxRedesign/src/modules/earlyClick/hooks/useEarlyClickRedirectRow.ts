import { isNextJs } from "../../../utils/isNextJs";
import { earlyClickHrefLessLinkProps } from "../utils/replay";
import { useEarlyClickRowBase } from "./useEarlyClickRow";

export type UseEarlyClickRedirectRowOptions = {
  /** The control opens a new tab (`target="_blank"`). */
  isRedirect: boolean;
  /** The auth URL exists, so the control has a real href. */
  hasUrl: boolean;
};

/**
 * Wires a redirect row: an `<a target="_blank">` whose href does not exist until the auth ticket
 * arrives. On Next.js, taps stay held until then (`rowProps`) and the link gets its own tab stop
 * (`linkProps`), because an anchor with no href is not keyboard reachable. On .NET both are inert,
 * so the control behaves as before. `isAwaitingUrl` is that same decision, for the caller to drop
 * its href (`earlyClickRedirectHref`) and to handle a tap that has nothing to open.
 */
export const useEarlyClickRedirectRow = (
  key: string,
  { isRedirect, hasUrl }: UseEarlyClickRedirectRowOptions,
) => {
  const isAwaitingUrl = isNextJs() && isRedirect && !hasUrl;
  return {
    isAwaitingUrl,
    rowProps: useEarlyClickRowBase(key, { isRedirect, isAwaitingUrl }),
    linkProps: isAwaitingUrl ? earlyClickHrefLessLinkProps : {},
  };
};
