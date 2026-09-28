/**
 * The ODP parent-handoff screen: its own full-page node type (not a TextScreen), modeled on the
 * sibling ToS node (UserAgreementNode) minus the bullets and legal copy. Copy arrives pre-translated.
 */

import { useCallback, useEffect, useRef, type JSX } from "react";
import { Button } from "@rbx/foundation-ui";

import { FullPageChrome, FULL_PAGE_CTA_INSET_CLASS } from "../FullPageChrome";
import { ODPTiltedCardsArt } from "../ODPTiltedCardsArt";
import { useOdpAnalytics } from "../../analytics/odpAnalytics";
import { asText } from "../../utils/nodeDetails";
import type { NodeComponent, NodeProps } from "../../types";

export type OdpHandoffDetails = {
  headerTitle: string;
  title: string;
  description: string;
  continueLabel: string;
};

export const OdpHandoffNode: NodeComponent = ({
  props,
  ctx,
  report,
  transitions,
}: NodeProps): JSX.Element => {
  const headerTitle = asText(props.headerTitle);
  const title = asText(props.title) ?? "";
  const description = asText(props.description);
  const continueLabel = asText(props.continueLabel) ?? "";
  const odpAnalytics = useOdpAnalytics(ctx);
  const { analyticsSessionId } = ctx;
  const hasReportedPageload = useRef(false);

  useEffect(() => {
    if (!hasReportedPageload.current) {
      hasReportedPageload.current = true;
      odpAnalytics.handoffShown(analyticsSessionId);
    }
  }, [odpAnalytics, analyticsSessionId]);

  const onContinue = useCallback(() => {
    odpAnalytics.handoffContinue(analyticsSessionId);
    report("Continue");
  }, [odpAnalytics, analyticsSessionId, report]);
  const onBack = useCallback(() => {
    odpAnalytics.handoffBack(analyticsSessionId);
    report("Back");
  }, [odpAnalytics, analyticsSessionId, report]);
  const onCancel = useCallback(() => {
    report("Cancel");
  }, [report]);

  // Back is transition-driven: the server only declares a `Back` transition when a Prologue preceded
  // this node. Without one, the server declares `Cancel` for the close affordance.
  const hasBack = transitions?.Back != null;
  const hasCancel = transitions?.Cancel != null;

  return (
    <FullPageChrome
      title={headerTitle}
      onBack={hasBack ? onBack : undefined}
      onClose={!hasBack && hasCancel ? onCancel : undefined}
    >
      <div className="gap-large flex grow flex-col" data-testid="amp-v2-wizard-odp-handoff">
        <div className="gap-xlarge flex flex-col">
          <ODPTiltedCardsArt />
          <div className="gap-none flex flex-col">
            <h2 className="text-heading-medium content-emphasis margin-none">{title}</h2>
            {description ? (
              <p className="text-body-large content-default margin-none">{description}</p>
            ) : null}
          </div>
        </div>
        <div
          className={`gap-small flex flex-col [margin-top:auto] ${FULL_PAGE_CTA_INSET_CLASS}`}
          data-testid="amp-v2-wizard-full-page-cta-stack"
        >
          <Button variant="Emphasis" size="Medium" className="width-full" onClick={onContinue}>
            {continueLabel}
          </Button>
        </div>
      </div>
    </FullPageChrome>
  );
};

// Renders its own full-page surface: the host must not add a modal overlay, nor a loading spinner
// (its spinner would mis-position against this fixed, out-of-flow node).
OdpHandoffNode.ownsOverlay = true;
OdpHandoffNode.ownsLoadingState = true;
