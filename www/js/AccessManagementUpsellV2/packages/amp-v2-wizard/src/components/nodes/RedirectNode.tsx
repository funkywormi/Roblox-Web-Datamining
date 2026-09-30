/**
 * Redirects to an external url.
 */

import { useEffect, useRef, type JSX } from "react";
import { ProgressCircle } from "@rbx/foundation-ui";
import { urlSafetyValidation } from "@rbx/core-scripts/util/url";

import { asText } from "../../utils/nodeDetails";
import type { NodeProps } from "../../types";

/** Reported when `url` is missing or is not a Roblox URL. No node declares it, so the walker error-exits. */
export const INVALID_REDIRECT_OUTCOME = "__invalidRedirect__";

/** Param the redirect destintion reads to send the user back to the initial entrypoint where the wizard launched. */
export const RETURN_PARAM = "redirectUrl";

/**
 * Analytics session id passed as query param to redirect destination, for event tracking
 */
export const ANALYTICS_SESSION_PARAM = "analyticsSessionId";

export function RedirectNode({ props, ctx, report }: NodeProps): JSX.Element {
  const url = asText(props.url);
  const { analyticsSessionId } = ctx;
  // The host keeps this instance across fragments, so a re-render must not navigate a second time.
  const handedOffTo = useRef<string | undefined>(undefined);

  useEffect(() => {
    const destination = url === undefined ? undefined : urlSafetyValidation(url);
    if (destination === undefined) {
      report(INVALID_REDIRECT_OUTCOME);
      return;
    }

    if (!destination.searchParams.has(RETURN_PARAM)) {
      destination.searchParams.set(RETURN_PARAM, window.location.href);
    }

    if (analyticsSessionId && !destination.searchParams.has(ANALYTICS_SESSION_PARAM)) {
      destination.searchParams.set(ANALYTICS_SESSION_PARAM, analyticsSessionId);
    }

    if (handedOffTo.current === destination.href) {
      return;
    }

    try {
      window.location.assign(destination.href);
    } catch {
      report(INVALID_REDIRECT_OUTCOME);
      return;
    }

    handedOffTo.current = destination.href;

    // Don't report any outcome on success, which would be reported as an exit and tear the amp wizard down while the
    // browser is still on the initial entrypoint page.
  }, [url, analyticsSessionId, report]);

  return (
    <div className="flex justify-center">
      <ProgressCircle ariaLabel="Redirecting" variant="Indeterminate" size="Medium" />
    </div>
  );
}

RedirectNode.ownsLoadingState = true;
