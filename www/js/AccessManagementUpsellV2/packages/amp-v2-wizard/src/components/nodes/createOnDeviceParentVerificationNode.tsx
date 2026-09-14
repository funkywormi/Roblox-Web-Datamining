/**
 * Builds a node that hands off to a Persona check against an ODP session.
 * `Submitted` means the parent completed the flow, but does not necessarily mean they passed the criteria to be a parent.
 * The verdict for that is ultimately resolved server-side and observed by `SessionPolling`.
 */

import type { JSX } from "react";
import { ProgressCircle } from "@rbx/foundation-ui";

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
  const OnDeviceParentVerificationNode = ({ props, report }: NodeProps): JSX.Element => {
    const sessionId = asText(props.sessionId) ?? "";

    useOnDeviceParentVerification({
      sessionId,
      method,
      onSettled: result => {
        reportSettled(report, result);
      },
    });

    return (
      <div className="flex justify-center">
        <ProgressCircle ariaLabel="Verifying" variant="Indeterminate" size="Medium" />
      </div>
    );
  };

  OnDeviceParentVerificationNode.ownsLoadingState = true;
  // Persona mounts its widget on document.body, outside the dialog.
  OnDeviceParentVerificationNode.ownsOverlay = true;

  return OnDeviceParentVerificationNode;
};
