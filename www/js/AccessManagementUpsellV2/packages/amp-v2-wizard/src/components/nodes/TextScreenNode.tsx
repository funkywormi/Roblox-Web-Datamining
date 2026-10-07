/**
 * A simple informational node: title, description, an optional image, and a set of buttons. Copy
 * arrives pre-translated in `props`.
 *
 * Buttons are server-driven: `buttons: [{ label, outcome }]` lets a flow report arbitrary outcomes,
 * so the node can branch to more than Success/Cancel. The node stays transition-agnostic — what an
 * outcome *does* (Goto / Continue / Exit) is decided by the server's transitions map.
 */

import { useEffect, useMemo, useRef, type JSX } from "react";
import { Button } from "@rbx/foundation-ui";

import { useOdpAnalytics, type OdpAnalytics } from "../../analytics/odpAnalytics";
import { NeedToReverifyNode, PrologueNode } from "../../analytics/odpAnalyticsConstants";
import { asButtons, asText, type TextScreenButton } from "../../utils/nodeDetails";
import { renderAnchoredCopy } from "../../utils/anchoredCopy";
import type { NodeContext, NodeProps } from "../../types";

export type TextScreenDetails = {
  title: string;
  description: string;
  imageUrl?: string;
  buttons: TextScreenButton[];
  /** Small print beneath the buttons, with any documents it references marked up as anchors. */
  footerText?: string;
};

export type TextScreenAnalytics = {
  shown: () => void;
  /** Sent before the screen reports a button's outcome. */
  buttonClick: (outcome: string) => void;
  /** Sent before the host's X reports Cancel. */
  close: () => void;
};

// One node type serves many screens, so each screen's spec events are registered under the node id
// the service serves it as. An unregistered screen sends nothing.
const TEXT_SCREEN_ANALYTICS = new Map<string, (analytics: OdpAnalytics) => TextScreenAnalytics>([
  [
    PrologueNode,
    analytics => ({
      shown: analytics.prologueShown,
      buttonClick: analytics.prologueButtonClick,
      close: () => {
        analytics.prologueButtonClick("Cancel");
      },
    }),
  ],
  [
    NeedToReverifyNode,
    analytics => ({
      shown: analytics.reverifyShown,
      buttonClick: analytics.reverifyButtonClick,
      close: analytics.reverifyClose,
    }),
  ],
]);

const noop = (): void => undefined;

const NO_TEXT_SCREEN_ANALYTICS: TextScreenAnalytics = {
  shown: noop,
  buttonClick: noop,
  close: noop,
};

/** The reporters registered for a text screen's node id, or ones that send nothing. */
export function getTextScreenAnalytics(
  analytics: OdpAnalytics,
  node: string | undefined,
): TextScreenAnalytics {
  const build = node == null ? undefined : TEXT_SCREEN_ANALYTICS.get(node);
  return build == null ? NO_TEXT_SCREEN_ANALYTICS : build(analytics);
}

// Sends "shown" on entering each node rather than on mount: the host keeps this node mounted when
// one text screen follows another.
function useTextScreenAnalytics(
  ctx: Pick<
    NodeContext,
    "analytics" | "analyticsStrings" | "analyticsSessionId" | "odpEventSurface"
  >,
): TextScreenAnalytics {
  const odpAnalytics = useOdpAnalytics(ctx);
  const { node } = ctx.analytics;
  const screen = useMemo(() => getTextScreenAnalytics(odpAnalytics, node), [odpAnalytics, node]);

  const shownNode = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (shownNode.current === node) {
      return;
    }
    shownNode.current = node;
    screen.shown();
  }, [node, screen]);

  return screen;
}

export function TextScreenNode({ props, ctx, report }: NodeProps): JSX.Element {
  const title = asText(props.title) ?? "";
  const description = asText(props.description) ?? "";
  const imageUrl = asText(props.imageUrl);
  const buttons = asButtons(props.buttons) ?? [];
  const footerText = asText(props.footerText);
  const screenAnalytics = useTextScreenAnalytics(ctx);

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
                screenAnalytics.buttonClick(button.outcome);
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
