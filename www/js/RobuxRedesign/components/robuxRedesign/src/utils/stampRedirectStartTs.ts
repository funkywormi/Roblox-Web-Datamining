import { REDIRECT_START_TS_QUERY_PARAM } from "../constants/loginRedirect";
import { trackCounter } from "../observability";

/** Appends/overwrites `redirectStartTs` on a redirect URL (click-time stamp). */
export function withRedirectStartTs(url: string, now = Date.now()): string {
  const parsed = new URL(url, window.location.origin);
  parsed.searchParams.set(REDIRECT_START_TS_QUERY_PARAM, String(now));

  if (/^https?:\/\//i.test(url)) {
    return parsed.toString();
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

/**
 * Stamps `redirectStartTs` onto an anchor's href synchronously on click so the
 * browser navigates with click-time latency rather than URL-compose time.
 */
export function stampRedirectStartTsOnClick(
  event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
): void {
  try {
    const { currentTarget } = event;
    if (!(currentTarget instanceof HTMLAnchorElement) || !currentTarget.getAttribute("href")) {
      return;
    }

    currentTarget.href = withRedirectStartTs(currentTarget.href);
  } catch {
    // Best-effort: never block navigation if stamping fails.
    trackCounter("StampRedirectStartTsFailed");
  }
}
