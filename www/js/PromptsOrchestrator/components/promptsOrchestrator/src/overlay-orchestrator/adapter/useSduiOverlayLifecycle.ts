import { useEffect } from "react";
import { useSduiCacheSubscription } from "@rbx/sdui-core/client";

import type { AppPage } from "../../common/constants/pageConstants";
import { getSduiApiStore } from "../../common/services/sduiServices";
import { finishPrompt } from "../scheduler/finishPrompt";
import { OverlayClosedReason, OverlayRenderer, type PromptFor } from "../types";

type DialogPrompt = typeof OverlayRenderer.DialogPrompt;

type UseSduiOverlayLifecycleInput = {
  prompt: PromptFor<DialogPrompt>;
  appPage: AppPage;
  configKey: string;
  promptIdentifier?: string;
};

/**
 * We need to subscribe to the sdui api cache to ensure that if a prompt is removed,
 * it is also removed from the overlay queue.
 */
export const useSduiOverlayLifecycle = ({
  prompt,
  appPage,
  configKey,
  promptIdentifier,
}: UseSduiOverlayLifecycleInput) => {
  const apiStore = getSduiApiStore(appPage);
  const cacheEntry = useSduiCacheSubscription(apiStore, configKey);
  const isPromptInCache =
    promptIdentifier !== undefined && cacheEntry?.configs.has(promptIdentifier) === true;

  useEffect(() => {
    if (!isPromptInCache) {
      finishPrompt<DialogPrompt>(prompt.id, {
        status: "closed",
        reason: OverlayClosedReason.Dismissed,
      });
    }
  }, [isPromptInCache, prompt.id]);

  return isPromptInCache;
};
