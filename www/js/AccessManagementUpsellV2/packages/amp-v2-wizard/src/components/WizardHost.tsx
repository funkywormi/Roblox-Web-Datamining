/**
 * The walker-owned host: runs the walker engine over an entrypoint fragment and renders the current
 * node's component from the registry in a modal overlay, swapping it in place as the flow advances.
 * If the backend emits a node type the registry can't render (capability drift), it reports an error
 * exit rather than blanking.
 */

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { Dialog, DialogBody, DialogContent, ProgressCircle } from "@rbx/foundation-ui";

import { defaultRegistry, getNodeComponent } from "../componentRegistry";
import { useWizardWalker, type WalkerEvent } from "../hooks/useWizardWalker";
import { WizardLoadingContext } from "./WizardLoadingContext";
import type {
  FlowApi,
  FlowExitResult,
  FlowResponse,
  NodeContext,
  Registry,
  Target,
} from "../types";

export type WizardHostProps = {
  initialFragment: FlowResponse;
  target?: Target;
  rootFlow?: string;
  surface: string;
  api: FlowApi;
  /** Client-specific wiring threaded to nodes via ctx.config (e.g. a route a node navigates to). */
  config?: Record<string, unknown>;
  registry?: Registry;
  onExit?: (result: FlowExitResult) => void;
  onEvent?: (event: WalkerEvent) => void;
};

function Overlay({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}): JSX.Element {
  return (
    <Dialog
      open
      isModal
      size="Medium"
      type="Default"
      hasCloseAffordance={onClose != null}
      closeLabel="Close"
      onOpenChange={isOpen => {
        // Covers Escape and the X alike, both of which close the dialog.
        if (!isOpen) {
          onClose?.();
        }
      }}
    >
      <DialogContent>
        {/* The close affordance is positioned absolutely, so a heading that runs the dialog's full
            width renders underneath it; leave it room on the screens that draw one. The button is
            36px wide and sits 13px in from the edge, so 2.5rem clears it with a gap to spare. */}
        <DialogBody
          className={
            onClose == null
              ? "gap-large flex flex-col"
              : "gap-large flex flex-col [&_h2]:[padding-inline-end:2.5rem]"
          }
        >
          {children}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export function WizardHost(props: WizardHostProps): JSX.Element | null {
  const registry = props.registry ?? defaultRegistry;
  const config = props.config ?? {};

  const walker = useWizardWalker({
    initialFragment: props.initialFragment,
    surface: props.surface,
    target: props.target,
    rootFlow: props.rootFlow,
    api: props.api,
    onExit: props.onExit,
    onEvent: props.onEvent,
  });

  const unrenderableReportedRef = useRef(false);
  const { currentNode, report, exited, isLoading } = walker;
  const Component = currentNode ? getNodeComponent(registry, currentNode.type) : undefined;

  useEffect(() => {
    if (currentNode != null && Component == null && !exited && !unrenderableReportedRef.current) {
      unrenderableReportedRef.current = true;
      // Reporting an outcome the node has no transition for drives the engine's error exit.
      report("__unrenderable__");
    }
  }, [currentNode, Component, exited, report]);

  if (exited) {
    return null;
  }

  // No node to render yet, or one the registry can't render (drift, being turned into an error exit
  // by the effect above): show a bare spinner in the meantime.
  if (currentNode == null || Component == null) {
    return (
      <Overlay>
        <ProgressCircle ariaLabel="Loading" variant="Indeterminate" size="Medium" />
      </Overlay>
    );
  }

  const ctx: NodeContext = {
    config,
    analytics: walker.eventContext,
    logEvent: walker.logEvent,
    analyticsStrings: walker.analyticsStrings,
  };

  // Keep the node mounted while a Continue is in flight, dimmed and non-interactive, under a spinner.
  // Nodes that have a busy state of their own (i.e a loading spinner) render it instead.
  const node = (
    <div className="relative">
      <div
        className={isLoading ? "pointer-events-none [opacity:0.5]" : undefined}
        data-testid="amp-v2-wizard-node-container"
      >
        <Component
          props={currentNode.details}
          ctx={ctx}
          report={report}
          transitions={currentNode.transitions}
        />
      </div>
      {isLoading && !Component.ownsLoadingState ? (
        <div
          className="absolute [inset:0] flex items-center justify-center"
          data-testid="amp-v2-wizard-loading-overlay"
        >
          <ProgressCircle ariaLabel="Loading" variant="Indeterminate" size="Medium" />
        </div>
      ) : null}
    </div>
  );

  // A node handing off to an overlay of its own gets no additional overlay.
  if (Component.ownsOverlay === true) {
    return <WizardLoadingContext.Provider value={isLoading}>{node}</WizardLoadingContext.Provider>;
  }

  // Nodes that treat dismissal as Cancel get the dialog's X alongside whatever buttons the flow
  // declares, but only where the server declared the transition — dismissing into an outcome the
  // flow doesn't know would error-exit.
  const dismissesOnCancel =
    Component.dismissesOnCancel === true && currentNode.transitions.Cancel != null;

  return (
    <Overlay
      onClose={
        dismissesOnCancel
          ? () => {
              report("Cancel");
            }
          : undefined
      }
    >
      {node}
    </Overlay>
  );
}
