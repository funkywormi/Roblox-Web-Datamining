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

/** Reported once the browser has been sent to the destination. */
export const REDIRECT_DONE_OUTCOME = "Done";

export function RedirectNode({ props, report }: NodeProps): JSX.Element {
  const url = asText(props.url);
  // The host keeps this instance across fragments, so a re-render must not navigate a second time.
  const handedOffTo = useRef<string | undefined>(undefined);

  useEffect(() => {
    const destination = url === undefined ? undefined : urlSafetyValidation(url);
    if (destination === undefined) {
      report(INVALID_REDIRECT_OUTCOME);
      return;
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
    report(REDIRECT_DONE_OUTCOME);
  }, [url, report]);

  return (
    <div className="flex justify-center">
      <ProgressCircle ariaLabel="Redirecting" variant="Indeterminate" size="Medium" />
    </div>
  );
}

RedirectNode.ownsLoadingState = true;
