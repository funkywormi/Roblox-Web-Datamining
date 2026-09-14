/**
 * Mints an ODP session on mount, then reports its id (`Success`) or `Error`.
 */

import { useEffect, type JSX } from "react";
import { ProgressCircle } from "@rbx/foundation-ui";

import { odpSessionApi } from "../../services/odpSessionApi";
import { asStringRecord, asText } from "../../utils/nodeDetails";
import type { NodeProps } from "../../types";

export type CreateOdpSessionDetails = {
  odpProfileId?: string;
  requestType: string;
  requestDetails?: Record<string, string>;
  isOdpInitiated?: boolean;
};

export function CreateOdpSessionNode({ props, report }: NodeProps): JSX.Element {
  const requestType = asText(props.requestType) ?? "";
  const odpProfileId = asText(props.odpProfileId);
  const isOdpInitiated = props.isOdpInitiated === true;
  const requestDetails = asStringRecord(props.requestDetails);

  useEffect(() => {
    let cancelled = false;

    odpSessionApi
      .startOdpSession({
        requestType,
        requestDetails,
        isOdpInitiatedRequest: isOdpInitiated,
        odpProfileId,
      })
      .then(response => {
        if (cancelled) {
          return;
        }
        // A 2xx that omits the id (backend skew, empty body) would otherwise advance the flow with no
        // session and fail later somewhere harder to trace; keep the failure local instead.
        const odpSessionId = asText(response.odpSessionId);
        if (odpSessionId != null && odpSessionId !== "") {
          report("Success", { odpSessionId });
        } else {
          report("Error");
        }
      })
      .catch(() => {
        if (!cancelled) {
          report("Error");
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-surface-0 fixed inset-[0px] flex items-center justify-center [z-index:1100]">
      <ProgressCircle ariaLabel="Loading" variant="Indeterminate" size="Medium" />
    </div>
  );
}

CreateOdpSessionNode.ownsLoadingState = true;
