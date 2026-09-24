/**
 * The top-level singleton host: mounted once, it listens for the `StartWizard` trigger from any
 * surface, fetches the entrypoint, and renders the flow via `WizardHost` at the page root — so the
 * modal's lifecycle is independent of the surface that started it. One flow at a time: a start that
 * arrives while a flow is live is rejected (its caller resolves `Error`).
 */

import { useCallback, useEffect, useRef, useState, type JSX } from "react";

import { buildEntrypointRequest } from "../utils/buildEntrypointRequest";
import { flowApi } from "../services/flowApi";
import { WizardHost } from "./WizardHost";
import { AmpV2WizardEvent, type StartWizardDetail } from "../services/wizardService";
import type { FlowExitResult, FlowResponse, FlowSelector } from "../types";

type Session = {
  detail: StartWizardDetail;
  fragment: FlowResponse;
};

function rootFlowOf(flow?: FlowSelector): string | undefined {
  return flow != null && flow.name !== "" ? flow.name : undefined;
}

export function WizardApp(): JSX.Element | null {
  const [session, setSession] = useState<Session | null>(null);
  // Synchronous "a flow is starting or running" gate for re-entrancy (state can't be read here).
  const busyRef = useRef(false);
  // The detail of the live flow, readable synchronously from the exit handler (which can't see the
  // latest `session` through its stable closure). Nulled on exit so callbacks fire exactly once.
  const activeDetailRef = useRef<StartWizardDetail | null>(null);

  useEffect(() => {
    const handler = (evt: WindowEventMap["AmpV2Wizard.StartWizard"]): void => {
      const { detail } = evt;

      if (busyRef.current) {
        // One flow at a time — reject the re-entrant start without touching the live flow.
        detail.closeCallback({ reason: "Error", flowId: "" });
        return;
      }
      busyRef.current = true;

      const api = detail.api ?? flowApi;

      api
        .entrypoint(
          buildEntrypointRequest(
            detail.target,
            detail.flow,
            detail.surface,
            detail.registry,
            detail.extraProps,
          ),
        )
        .then(fragment => {
          if (fragment.entry === "" && fragment.outcome !== "Error") {
            // Nothing to run (granted / denied / no upsell) — resolve without rendering, and do NOT
            // fire onComplete: no flow ran, so there's nothing for the caller to refresh against.
            busyRef.current = false;
            detail.closeCallback({ reason: "Completed", flowId: fragment.flowId });
            return;
          }
          activeDetailRef.current = detail;
          setSession({ detail, fragment });
        })
        .catch(() => {
          busyRef.current = false;
          detail.closeCallback({ reason: "Error", flowId: "" });
        });
    };

    window.addEventListener(AmpV2WizardEvent.StartWizard, handler);
    return () => {
      window.removeEventListener(AmpV2WizardEvent.StartWizard, handler);
    };
  }, []);

  // A flow ran and exited: clear the slot (nulling the ref first so callbacks fire once), then resolve
  // the caller and fire onComplete — the real-exit path, skipped for an empty entry or rejected start.
  const handleExit = useCallback((result: FlowExitResult): void => {
    const detail = activeDetailRef.current;
    activeDetailRef.current = null;
    busyRef.current = false;
    setSession(null);
    detail?.closeCallback(result);
    detail?.onComplete?.(result);
  }, []);

  if (session == null) {
    return null;
  }

  const { detail, fragment } = session;

  return (
    <WizardHost
      initialFragment={fragment}
      target={detail.target}
      rootFlow={rootFlowOf(detail.flow)}
      surface={detail.surface}
      api={detail.api ?? flowApi}
      config={detail.config}
      registry={detail.registry}
      onExit={handleExit}
      onEvent={detail.onEvent}
    />
  );
}
