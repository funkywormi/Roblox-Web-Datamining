/**
 * The returning-parent PIN screen: six digit boxes a parent fills to prove the parent account on
 * this device is theirs.
 *
 * All copy arrives pre-translated.
 */

import { useCallback, useEffect, useState, type JSX } from "react";
import { Link, ProgressCircle } from "@rbx/foundation-ui";
import { CodeInput } from "@rbx/user-settings";

import { FullPageChrome } from "../FullPageChrome";
import { asText } from "../../utils/nodeDetails";
import type { NodeProps } from "../../types";

const PIN_LENGTH = 6;

export type PinEntryDetails = {
  headerTitle?: string;
  title: string;
  description: string;
  inputLabel: string;
  forgotPinLabel: string;
  showPinLabel: string;
  hidePinLabel: string;
  error?: string;
  // provided by the backend, but not currently used
  attemptsRemaining?: number;
};

export function PinEntryNode({ props, report, transitions }: NodeProps): JSX.Element {
  const headerTitle = asText(props.headerTitle);
  const title = asText(props.title) ?? "";
  const description = asText(props.description);
  const inputLabel = asText(props.inputLabel) ?? "";
  const forgotPinLabel = asText(props.forgotPinLabel);
  const showPinLabel = asText(props.showPinLabel);
  const hidePinLabel = asText(props.hidePinLabel);
  const error = asText(props.error);

  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A wrong PIN comes back from the service as a re-render of this node carrying `error` in a fresh
  // details object; that identity change is what drops the digits the last attempt typed.
  useEffect(() => {
    setPin("");
    setIsSubmitting(false);
  }, [props]);

  const onComplete = useCallback(
    (code: string) => {
      setIsSubmitting(true);
      report("Success", { pin: code });
    },
    [report],
  );

  const onForgotPin = useCallback(() => {
    setIsSubmitting(true);
    report("ForgotPin");
  }, [report]);

  const hasBack = transitions?.Back != null;
  const onBack = useCallback(() => {
    report("Back");
  }, [report]);
  const hasCancel = transitions?.Cancel != null;
  const onCancel = useCallback(() => {
    report("Cancel");
  }, [report]);

  return (
    <FullPageChrome
      title={headerTitle}
      onBack={hasBack ? onBack : undefined}
      onClose={!hasBack && hasCancel ? onCancel : undefined}
    >
      <div className="relative flex grow flex-col" data-testid="amp-v2-wizard-pin-entry">
        <div className="gap-xlarge flex flex-col">
          <div className="gap-none flex flex-col">
            <h2 className="text-heading-medium content-emphasis margin-none">{title}</h2>
            {description ? (
              <p className="text-body-large content-default margin-none">{description}</p>
            ) : null}
            {forgotPinLabel ? (
              <Link
                as="button"
                type="button"
                underline="always"
                className="text-body-large self-start"
                onClick={onForgotPin}
              >
                {forgotPinLabel}
              </Link>
            ) : null}
          </div>
          <CodeInput
            value={pin}
            onChange={setPin}
            onComplete={onComplete}
            label={inputLabel}
            showLabel={showPinLabel}
            hideLabel={hidePinLabel}
            error={error}
            length={PIN_LENGTH}
            disabled={isSubmitting}
          />
        </div>
        {isSubmitting ? (
          <div
            className="absolute [inset:0] flex items-center justify-center"
            data-testid="amp-v2-wizard-pin-entry-submitting"
          >
            <ProgressCircle ariaLabel="Loading" variant="Indeterminate" size="Medium" />
          </div>
        ) : null}
      </div>
    </FullPageChrome>
  );
}

PinEntryNode.ownsOverlay = true;
PinEntryNode.ownsLoadingState = true;
