import { useCallback, useEffect, useRef, useState } from "react";
import { trackCounter } from "../creditCheckout/observability";
import {
  REDEMPTION_POLL_OUTCOMES,
  REDEMPTION_STATUS_FAILURE_REASONS,
} from "./redemptionStatusConstants";
import type {
  RedemptionStatusResponse,
  RedemptionStatusFailure,
  RedemptionPollSource,
} from "./redemptionStatusService";
import { pollRedemptionStatus } from "./redemptionStatusService";

type UseRedemptionStatusPollArgs = {
  source: RedemptionPollSource;
  onTerminal: (response: RedemptionStatusResponse) => void;
  onExhausted: () => void;
  onFailed: (failure: RedemptionStatusFailure) => void;
};

type UseRedemptionStatusPoll = {
  startPoll: (workflowId: string) => void;
  isPolling: boolean;
};

const useRedemptionStatusPoll = ({
  source,
  onTerminal,
  onExhausted,
  onFailed,
}: UseRedemptionStatusPollArgs): UseRedemptionStatusPoll => {
  const [isPolling, setIsPolling] = useState(false);

  // A mount flag alone cannot distinguish a new redemption from a superseded run.
  const runIdRef = useRef(0);
  const unmountedRef = useRef(false);
  const inFlightRef = useRef(false);

  // Keep startPoll stable without capturing stale form state.
  const callbacksRef = useRef({ onTerminal, onExhausted, onFailed });
  callbacksRef.current = { onTerminal, onExhausted, onFailed };

  const startPoll = useCallback(
    (workflowId: string) => {
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;
      inFlightRef.current = true;
      setIsPolling(true);

      const isStale = () => unmountedRef.current || runIdRef.current !== runId;

      const run = async () => {
        try {
          const result = await pollRedemptionStatus({ workflowId, isCancelled: isStale, source });
          if (isStale()) {
            return;
          }

          if (result.outcome === REDEMPTION_POLL_OUTCOMES.Terminal) {
            callbacksRef.current.onTerminal(result.response);
          } else if (result.outcome === REDEMPTION_POLL_OUTCOMES.Exhausted) {
            callbacksRef.current.onExhausted();
          } else if (result.outcome === REDEMPTION_POLL_OUTCOMES.Failed) {
            callbacksRef.current.onFailed(result);
          }
        } catch (err) {
          if (isStale()) {
            return;
          }
          callbacksRef.current.onFailed({
            reason: REDEMPTION_STATUS_FAILURE_REASONS.Unexpected,
            error: err,
          });
        } finally {
          if (!unmountedRef.current && runIdRef.current === runId) {
            inFlightRef.current = false;
            setIsPolling(false);
          }
        }
      };

      // Prevent an unhandled rejection if onFailed itself throws.
      run().catch(() => undefined);
    },
    [source],
  );

  useEffect(
    () => () => {
      unmountedRef.current = true;
      if (inFlightRef.current) {
        trackCounter("GiftCard_RedeemPollUnmounted", { source });
      }
    },
    [source],
  );

  return { startPoll, isPolling };
};

export default useRedemptionStatusPoll;
