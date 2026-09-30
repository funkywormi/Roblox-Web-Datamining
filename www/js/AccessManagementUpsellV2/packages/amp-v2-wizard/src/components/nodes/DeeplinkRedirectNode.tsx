import { useEffect, useState, type JSX } from "react";
import { TranslationProvider } from "@rbx/core-scripts/react";
import { ProgressCircle } from "@rbx/foundation-ui";
import { GenericErrorModal } from "../GenericErrorModal";
import { Overlay } from "../Overlay";
import { openNativeOdpFlow } from "../../services/nativeOdpFlowHandoff";
import { asText } from "../../utils/nodeDetails";
import type { NodeProps } from "../../types";

const HANDOFF_TIMEOUT_MS = 10000;

export function DeeplinkRedirectNode({ props, report }: NodeProps): JSX.Element {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    let active = true;
    // Dispatch success does not confirm native navigation. Fail locally without advancing web.
    const timeout = window.setTimeout(() => {
      active = false;
      setTimedOut(true);
    }, HANDOFF_TIMEOUT_MS);
    const stayOnWeb = () => {
      window.clearTimeout(timeout);
      if (active) report("StayOnWeb");
    };
    const stopWaiting = () => {
      window.clearTimeout(timeout);
      active = false;
    };
    const onVisibilityChange = () => {
      if (document.hidden) stopWaiting();
    };
    window.addEventListener("pagehide", stopWaiting);
    document.addEventListener("visibilitychange", onVisibilityChange);
    openNativeOdpFlow(asText(props.odpSessionId) ?? "").then(handedOff => {
      if (!handedOff) stayOnWeb();
    }, stayOnWeb);
    return () => {
      stopWaiting();
      window.removeEventListener("pagehide", stopWaiting);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one dispatch per handoff node mount
  }, []);

  if (timedOut) {
    return (
      <TranslationProvider config={["Feature.Parents", "CommonUI.Controls"]}>
        <GenericErrorModal
          onClose={() => {
            report("__handoffFailed__");
          }}
        />
      </TranslationProvider>
    );
  }

  return (
    <Overlay
      onClose={() => {
        report("__handoffFailed__");
      }}
    >
      <ProgressCircle ariaLabel="Loading" variant="Indeterminate" size="Medium" />
    </Overlay>
  );
}

DeeplinkRedirectNode.ownsOverlay = true;
DeeplinkRedirectNode.ownsLoadingState = true;
