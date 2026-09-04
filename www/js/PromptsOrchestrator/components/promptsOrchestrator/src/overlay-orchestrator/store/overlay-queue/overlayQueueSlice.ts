import type { StateCreator } from "zustand";

import type { OverlayPrompt } from "../../types";

export type ActiveOverlay = {
  status: "active" | "dismissing";
  prompt: OverlayPrompt;
};

export type OverlayQueue = {
  /**
   * Tracks the number of times each prompt has been seen during the session.
   * Keyed by the prompt's dedupeKey.
   */
  seenOverlays: Record<string, number>;
  activeOverlay: ActiveOverlay | null;
  overlay: OverlayPrompt[];
};

export type ResetQueueResult = {
  activeOverlay: ActiveOverlay | null;
  abandonedPrompts: OverlayPrompt[];
};

export type OverlayQueueSlice = {
  queue: OverlayQueue;
  enqueuePrompt: (prompt: OverlayPrompt) => void;
  activatePrompt: (id: string) => void;
  markActivePromptForDismissal: (id: string) => OverlayPrompt | null;
  removeActivePrompt: (id: string) => void;
  resetQueue: () => ResetQueueResult;
};

export const createOverlayQueueSlice: StateCreator<
  OverlayQueueSlice,
  [],
  [],
  OverlayQueueSlice
> = set => {
  return {
    queue: {
      seenOverlays: {},
      activeOverlay: null,
      overlay: [],
    },
    resetQueue: () => {
      let result: ResetQueueResult = {
        activeOverlay: null,
        abandonedPrompts: [],
      };

      set(state => {
        result = {
          activeOverlay: state.queue.activeOverlay,
          abandonedPrompts: state.queue.overlay,
        };

        return {
          ...state,
          queue: { ...state.queue, activeOverlay: null, overlay: [] },
        };
      });

      return result;
    },
    enqueuePrompt: prompt => {
      set(state => ({
        ...state,
        queue: {
          ...state.queue,
          overlay: [...state.queue.overlay, prompt],
        },
      }));
    },
    activatePrompt: id => {
      set(state => {
        if (state.queue.activeOverlay) {
          return state;
        }

        const promptIndex = state.queue.overlay.findIndex(prompt => prompt.id === id);
        const prompt = state.queue.overlay[promptIndex];
        if (!prompt) {
          return state;
        }

        return {
          ...state,
          queue: {
            ...state.queue,
            activeOverlay: {
              status: "active",
              prompt,
            },
            seenOverlays: {
              ...state.queue.seenOverlays,
              [prompt.dedupeKey]: (state.queue.seenOverlays[prompt.dedupeKey] ?? 0) + 1,
            },
            overlay: state.queue.overlay.filter((_, index) => index !== promptIndex),
          },
        };
      });
    },
    markActivePromptForDismissal: id => {
      let dismissedPrompt: OverlayPrompt | null = null;

      set(state => {
        if (
          state.queue.activeOverlay?.prompt.id !== id ||
          state.queue.activeOverlay.status === "dismissing"
        ) {
          return state;
        }

        dismissedPrompt = state.queue.activeOverlay.prompt;
        return {
          ...state,
          queue: {
            ...state.queue,
            activeOverlay: {
              ...state.queue.activeOverlay,
              status: "dismissing",
            },
          },
        };
      });

      return dismissedPrompt;
    },
    removeActivePrompt: id => {
      set(state => {
        if (
          state.queue.activeOverlay?.prompt.id !== id ||
          state.queue.activeOverlay.status !== "dismissing"
        ) {
          return state;
        }

        return {
          ...state,
          queue: {
            ...state.queue,
            activeOverlay: null,
          },
        };
      });
    },
  };
};
