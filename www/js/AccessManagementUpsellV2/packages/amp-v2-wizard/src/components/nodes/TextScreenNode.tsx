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
import type { NodeProps } from "../../types";

export type TextScreenDetails = {
  title: string;
  description: string;
  imageUrl?: string;
  buttons: TextScreenButton[];
};

export function TextScreenNode({ props, report }: NodeProps): JSX.Element {
  const title = asText(props.title) ?? "";
  const description = asText(props.description) ?? "";
  const imageUrl = asText(props.imageUrl);
  const buttons = asButtons(props.buttons) ?? [];

  return (
    <div className="gap-medium flex flex-col items-center">
      {imageUrl ? <img src={imageUrl} alt="" className="max-w-full" /> : null}
      <h2 className="text-heading-medium content-emphasis text-center">{title}</h2>
      <p className="text-body-medium content-default text-center">{description}</p>
      {buttons.map((button, index) => (
        <Button
          key={button.outcome}
          variant={index === 0 ? "Emphasis" : "Standard"}
          size="Medium"
          className="w-full"
          onClick={() => {
            report(button.outcome);
          }}
        >
          {button.label}
        </Button>
      ))}
    </div>
  );
}
