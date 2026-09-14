/**
 * Reports `Poll` on a timer, and the backend either re-serves this polling node or routes on to the next node.
 */

import { useEffect, type JSX } from "react";
import { ProgressCircle } from "@rbx/foundation-ui";

import { PollingOutcome } from "../../constants/nodeOutcomes";
import { asNumber } from "../../utils/nodeDetails";
import type { NodeProps } from "../../types";

const DEFAULT_POLL_INTERVAL_MS = 2000;

export function SessionPollingNode({ props, report }: NodeProps): JSX.Element {
  const declaredInterval = asNumber(props.pollIntervalMs);
  const pollIntervalMs =
    declaredInterval !== undefined && declaredInterval > 0
      ? declaredInterval
      : DEFAULT_POLL_INTERVAL_MS;

  useEffect(() => {
    const timer = setTimeout(() => {
      report(PollingOutcome.Poll);
    }, pollIntervalMs);
    return () => {
      clearTimeout(timer);
    };
  }, [props, pollIntervalMs, report]);

  return (
    <div className="flex justify-center">
      <ProgressCircle ariaLabel="Waiting" variant="Indeterminate" size="Medium" />
    </div>
  );
}

SessionPollingNode.ownsLoadingState = true;
