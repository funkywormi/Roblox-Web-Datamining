/**
 * A simple informational node: title, description, an optional image, and a set of buttons. Copy
 * arrives pre-translated in `props`.
 *
 * Buttons are server-driven: `buttons: [{ label, outcome }]` lets a flow report arbitrary outcomes,
 * so the node can branch to more than Success/Cancel. The node stays transition-agnostic — what an
 * outcome *does* (Goto / Continue / Exit) is decided by the server's transitions map.
 */

import type { JSX } from "react";
import { Button } from "@rbx/foundation-ui";

import { asButtons, asText, type TextScreenButton } from "../../utils/nodeDetails";
import { renderAnchoredCopy } from "../../utils/anchoredCopy";
import type { NodeProps } from "../../types";

export type TextScreenDetails = {
  title: string;
  description: string;
  imageUrl?: string;
  buttons: TextScreenButton[];
  /** Small print beneath the buttons, with any documents it references marked up as anchors. */
  footerText?: string;
};

export function TextScreenNode({ props, report }: NodeProps): JSX.Element {
  const title = asText(props.title) ?? "";
  const description = asText(props.description) ?? "";
  const imageUrl = asText(props.imageUrl);
  const buttons = asButtons(props.buttons) ?? [];
  const footerText = asText(props.footerText);

  return (
    <div className="gap-large flex flex-col">
      {imageUrl ? <img src={imageUrl} alt="" className="width-full" /> : null}
      <div className="gap-xsmall flex flex-col">
        <h2 className="text-heading-medium content-emphasis margin-none">{title}</h2>
        <p className="text-body-medium content-default margin-none">{description}</p>
      </div>
      <div className="gap-medium flex flex-col">
        <div className="gap-small flex flex-col">
          {buttons.map((button, index) => (
            <Button
              key={button.outcome}
              variant={index === 0 ? "Emphasis" : "Standard"}
              size="Medium"
              className="width-full"
              onClick={() => {
                report(button.outcome);
              }}
            >
              {button.label}
            </Button>
          ))}
        </div>
        {footerText ? (
          <p
            className="text-body-small content-default margin-none"
            data-testid="amp-v2-wizard-text-screen-footer"
          >
            {renderAnchoredCopy(footerText)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// The host's dialog draws an X that reports Cancel, the same outcome a flow's own Cancel button
// reports — the two are interchangeable ways to leave the screen, not separate branches.
TextScreenNode.dismissesOnCancel = true;
