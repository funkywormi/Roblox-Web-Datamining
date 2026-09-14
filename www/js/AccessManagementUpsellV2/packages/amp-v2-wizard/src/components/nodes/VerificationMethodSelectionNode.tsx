/**
 * Lets a parent choose how to prove they are an adult. The chosen method id *is* the reported outcome,
 * which the server's transitions map points at that method's subflow.
 *
 * Framed as a full page rather than in the host's dialog, so it carries its own chrome.
 */

import { useEffect, useState, type JSX } from "react";
import {
  Button,
  OptionSelector,
  ProgressCircle,
  type TOptionSelectorProps,
} from "@rbx/foundation-ui";

import { FullPageChrome } from "../FullPageChrome";
import { useOdpAnalytics } from "../../analytics/odpAnalytics";
import { asMethodOptions, asText, type VerificationMethodOption } from "../../utils/nodeDetails";
import type { NodeProps } from "../../types";

export type VerificationMethodSelectionDetails = {
  headerTitle?: string;
  title: string;
  description: string;
  optionsLabel: string;
  continueLabel: string;
  methods: VerificationMethodOption[];
  sessionId?: string;
  recovery?: boolean;
};

const METHOD_ICONS: Record<string, TOptionSelectorProps["icon"]> = {
  FAE: "icon-regular-square-person",
  IDV: "icon-regular-rectangle-person-with-three-horizontal-lines",
  CCV: "icon-regular-credit-card",
};

export function VerificationMethodSelectionNode({
  props,
  ctx,
  report,
  transitions,
}: NodeProps): JSX.Element {
  const headerTitle = asText(props.headerTitle);
  const title = asText(props.title) ?? "";
  const description = asText(props.description) ?? "";
  const optionsLabel = asText(props.optionsLabel) ?? "";
  const continueLabel = asText(props.continueLabel) ?? "";
  const methods = asMethodOptions(props.methods) ?? [];

  const sessionId = asText(props.sessionId);
  const odpAnalytics = useOdpAnalytics(ctx);
  const [selected, setSelected] = useState(methods[0]?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    odpAnalytics.verificationMethodSelectorShown(sessionId, methods[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A fresh details object means the server re-served this screen, so the spinner from the last
  // outcome is stale — without this the node stays busy forever when a report does not replace it.
  useEffect(() => {
    setIsSubmitting(false);
  }, [props]);

  // Back is transition-driven: the server declares it only when a screen recorded itself as its
  // target, so the chevron appears exactly when there is somewhere to go back to.
  const hasBack = transitions?.Back != null;

  return (
    <FullPageChrome
      title={headerTitle}
      onBack={
        hasBack
          ? () => {
              setIsSubmitting(true);
              report("Back");
            }
          : undefined
      }
    >
      <div
        className="relative flex grow flex-col"
        data-testid="amp-v2-wizard-verification-method-selection"
      >
        <div className="gap-large flex flex-col">
          <div className="gap-xsmall flex flex-col">
            <h2 className="text-heading-medium content-emphasis margin-none">{title}</h2>
            <p className="text-body-medium content-default margin-none">{description}</p>
          </div>
          <div className="gap-small flex flex-col">
            <span className="text-body-small content-muted">{optionsLabel}</span>
            <div className="gap-medium flex flex-col" role="group" aria-label={optionsLabel}>
              {methods.map(method => (
                <OptionSelector
                  key={method.id}
                  layout="Horizontal"
                  size="Medium"
                  type="Checkmark"
                  label={method.label}
                  description={method.description}
                  icon={METHOD_ICONS[method.id]}
                  isSelected={selected === method.id}
                  onSelect={() => {
                    odpAnalytics.verificationMethodSelected(sessionId, method.id);
                    setSelected(method.id);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        {selected !== undefined ? (
          // Pinned to the bottom of the page, rather than sitting under the list as it did in the card.
          <div className="gap-small flex flex-col [margin-top:auto]">
            <Button
              variant="Emphasis"
              size="Medium"
              className="width-full"
              onClick={() => {
                odpAnalytics.verificationMethodContinue(sessionId, selected);
                setIsSubmitting(true);
                report(selected);
              }}
            >
              {continueLabel}
            </Button>
          </div>
        ) : null}
        {isSubmitting ? (
          <div
            className="absolute [inset:0] flex items-center justify-center"
            data-testid="amp-v2-wizard-verification-method-selection-submitting"
          >
            <ProgressCircle ariaLabel="Loading" variant="Indeterminate" size="Medium" />
          </div>
        ) : null}
      </div>
    </FullPageChrome>
  );
}

// Renders its own full-page surface, so the host must not add a modal overlay — nor its spinner,
// which would mis-position against this fixed, out-of-flow node.
VerificationMethodSelectionNode.ownsOverlay = true;
VerificationMethodSelectionNode.ownsLoadingState = true;
