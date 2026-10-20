import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { window as browserWindow } from "@rbx/core-lib/browser";
import { getItem } from "@rbx/core-lib/local-storage";
import ExperimentationService from "@rbx/experimentation";
import { chatQueryKeys } from "../constants/queryKeys";
import { isQueryPending } from "../utils/queryStatus";

export const UNIFIED_CHAT_WINDOW_IXP_LAYER = "Website.WebChat.UnifiedChatWindow";
/** Chat waits this long for the layer when it starts open; after that it shows the floating chat. */
export const UNIFIED_CHAT_WINDOW_IXP_TIMEOUT_MS = 3000;
const ENABLED_PARAMETER = "isUnifiedChatWindowEnabled";

// Developer override that shows the two-pane window without an IXP assignment:
// `localStorage.setItem("reactChatUnifiedWindow", "true")`. It never logs exposure.
declare module "@rbx/core-lib/local-storage" {
  interface LocalStorageRegistry {
    reactChatUnifiedWindow: boolean;
  }
}

export type TUnifiedChatWindowExperiment = {
  /** Show the two-pane chat window: IXP treatment, or the developer override. */
  isEnabled: boolean;
  /** The layer request finished. A failed or timed-out request counts as finished and means control. */
  isSettled: boolean;
  /**
   * Logs layer exposure on the first call after the layer answered. ExperimentationService only
   * sends it for users the layer assigned to an experiment. It does nothing before the answer,
   * after a failure or timeout (the user saw control whatever their arm is), or while the developer
   * override is on.
   */
  logExposureOnce: () => void;
};

type TLayerResult =
  | { status: "answered"; parameters: Record<string, unknown> }
  | { status: "failed" | "timedOut" };

const fetchLayerParameters = (): Promise<TLayerResult> =>
  new Promise(resolve => {
    const timer = setTimeout(() => {
      resolve({ status: "timedOut" });
    }, UNIFIED_CHAT_WINDOW_IXP_TIMEOUT_MS);
    ExperimentationService.getAllValuesForLayer(UNIFIED_CHAT_WINDOW_IXP_LAYER)
      .then(
        (parameters): TLayerResult => ({ status: "answered", parameters }),
        (): TLayerResult => ({ status: "failed" }),
      )
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((): undefined => undefined);
  });

const readDeveloperOverride = (): boolean =>
  browserWindow != null && getItem("reactChatUnifiedWindow") === true;

export const useUnifiedChatWindowExperiment = (): TUnifiedChatWindowExperiment => {
  const query = useQuery({
    queryKey: chatQueryKeys.unifiedChatWindowLayer(),
    queryFn: fetchLayerParameters,
    staleTime: Infinity,
  });
  const [isDeveloperOverrideOn] = useState(readDeveloperOverride);
  const exposureLoggedRef = useRef(false);
  const isAnswered = query.data?.status === "answered";
  const isTreatment =
    query.data?.status === "answered" && query.data.parameters[ENABLED_PARAMETER] === true;

  const logExposureOnce = useCallback(() => {
    if (exposureLoggedRef.current || isDeveloperOverrideOn || !isAnswered) {
      return;
    }
    exposureLoggedRef.current = true;
    ExperimentationService.logLayerExposure(UNIFIED_CHAT_WINDOW_IXP_LAYER);
  }, [isAnswered, isDeveloperOverrideOn]);

  return {
    isEnabled: isTreatment || isDeveloperOverrideOn,
    isSettled: !isQueryPending(query),
    logExposureOnce,
  };
};

export default useUnifiedChatWindowExperiment;
