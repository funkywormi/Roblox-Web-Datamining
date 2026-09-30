/**
 * Builds a node that hands off to a Persona check against an ODP session.
 * `Submitted` means the parent completed the flow, but does not necessarily mean they passed the criteria to be a parent.
 * The verdict for that is ultimately resolved server-side and observed by `SessionPolling`.
 */

import type { JSX } from "react";
import { ProgressCircle } from "@rbx/foundation-ui";

import { useOdpAnalytics } from "../../analytics/odpAnalytics";
import { ChallengeOutcome } from "../../constants/nodeOutcomes";
import { asText } from "../../utils/nodeDetails";
import { useOnDeviceParentVerification, VendorOutcome } from "../../onDeviceParentVerification";
import type {
  OnDeviceParentVerificationMethod,
  VendorSessionResult,
} from "../../onDeviceParentVerification";
import type { NodeComponent, NodeProps, ReportFn } from "../../types";

const reportSettled = (report: ReportFn, result: VendorSessionResult): void => {
  switch (result.outcome) {
    case VendorOutcome.Submitted:
      report(ChallengeOutcome.Submitted);
      break;
    case VendorOutcome.Cancelled:
      report(ChallengeOutcome.Cancel);
      break;
    case VendorOutcome.Failed:
      report(ChallengeOutcome.Failure, { reason: result.failure });
      break;
  }
};

export const createOnDeviceParentVerificationNode = (
  method: OnDeviceParentVerificationMethod,
): NodeComponent => {
  const OnDeviceParentVerificationNode = ({ props, ctx, report }: NodeProps): JSX.Element => {
    const sessionId = asText(props.sessionId) ?? "";
    const odpAnalytics = useOdpAnalytics(ctx);

    useOnDeviceParentVerification({
      sessionId,
      method,
      onSettled: result => {
        if (result.outcome === VendorOutcome.Failed) {
          odpAnalytics.verificationFailed(method, result.failure);
        }
        reportSettled(report, result);
      },
    });

    return (
      <div className="pointer-events-none fixed [inset:0] flex items-center justify-center">
        <ProgressCircle ariaLabel="Verifying" variant="Indeterminate" size="Medium" />
      </div>
    );
  };

  OnDeviceParentVerificationNode.ownsLoadingState = true;
  // Persona mounts its widget on document.body, outside the dialog.
  OnDeviceParentVerificationNode.ownsOverlay = true;

  return OnDeviceParentVerificationNode;
};
