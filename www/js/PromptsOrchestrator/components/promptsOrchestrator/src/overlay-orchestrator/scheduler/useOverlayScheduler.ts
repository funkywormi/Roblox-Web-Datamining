import { unstable_batchedUpdates } from "react-dom";
import { useEffect } from "react";

import { subscribeToUrlChange } from "@rbx/www-common/navigation";
import { selectOverlayQueue } from "../store/overlay-queue/overlayQueueSelectors";
import type { OverlayQueue } from "../store/overlay-queue/overlayQueueSlice";
import { useOverlayOrchestratorStore } from "../store/overlayOrchestratorStore";
import { resetQueueForNavigation } from "./resetQueueForNavigation";

const activateNextPrompt = (queue: OverlayQueue) => {
  if (queue.activeOverlay != null || queue.overlay.length === 0) {
    return;
  }

  const nextPrompt = queue.overlay[0];
  if (!nextPrompt) {
    return;
  }

  // needed to prevent zombie-child effect: https://zustand.docs.pmnd.rs/learn/guides/event-handler-in-pre-react-18#calling-actions-outside-a-react-event-handler-in-pre-react-18
  unstable_batchedUpdates(() => {
    useOverlayOrchestratorStore.getState().activatePrompt(nextPrompt.id);
  });
};

export const useOverlayScheduler = () => {
  useEffect(() => {
    const unsubscribeQueue = useOverlayOrchestratorStore.subscribe(
      selectOverlayQueue,
      activateNextPrompt,
      // Process prompts queued before the scheduler effect subscribed.
      { fireImmediately: true },
    );

    let previousPathname = window.location.pathname;
    const unsubscribeUrlChange = subscribeToUrlChange(() => {
      if (window.location.pathname !== previousPathname) {
        // needed to prevent zombie-child effect: https://zustand.docs.pmnd.rs/learn/guides/event-handler-in-pre-react-18#calling-actions-outside-a-react-event-handler-in-pre-react-18
        unstable_batchedUpdates(() => {
          resetQueueForNavigation();
        });
      }
      previousPathname = window.location.pathname;
    });

    return () => {
      unsubscribeQueue();
      unsubscribeUrlChange();
    };
  }, []);
};
