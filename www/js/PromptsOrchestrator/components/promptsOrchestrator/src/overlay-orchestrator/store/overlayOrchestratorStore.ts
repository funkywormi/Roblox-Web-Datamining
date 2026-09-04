import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
  type PersistOptions,
} from "zustand/middleware";

import {
  createOverlayQueueSlice,
  type OverlayQueue,
  type OverlayQueueSlice,
} from "./overlay-queue/overlayQueueSlice";

export type OverlayOrchestratorStore = OverlayQueueSlice;

type PersistedOverlayOrchestratorStore = {
  queue: Pick<OverlayQueue, "seenOverlays">;
};

const isPersistedOverlayOrchestratorStore = (
  state: unknown,
): state is PersistedOverlayOrchestratorStore => {
  if (typeof state !== "object" || state === null || !("queue" in state)) {
    return false;
  }

  const { queue } = state;
  if (typeof queue !== "object" || queue === null || !("seenOverlays" in queue)) {
    return false;
  }

  const { seenOverlays } = queue;
  return (
    typeof seenOverlays === "object" &&
    seenOverlays !== null &&
    Object.values(seenOverlays).every(value => typeof value === "number")
  );
};

const persistOptions = {
  name: "prompts-overlay-orchestrator",
  storage: createJSONStorage<PersistedOverlayOrchestratorStore>(() => sessionStorage),
  partialize: state => ({
    queue: {
      seenOverlays: state.queue.seenOverlays,
    },
  }),
  merge: (persistedState, currentState) => {
    if (!isPersistedOverlayOrchestratorStore(persistedState)) {
      return currentState;
    }

    return {
      ...currentState,
      queue: {
        ...currentState.queue,
        ...persistedState.queue,
      },
    };
  },
} satisfies PersistOptions<OverlayOrchestratorStore, PersistedOverlayOrchestratorStore>;

export const useOverlayOrchestratorStore = create<OverlayOrchestratorStore>()(
  persist(
    subscribeWithSelector((...args) => ({
      ...createOverlayQueueSlice(...args),
    })),
    persistOptions,
  ),
);
