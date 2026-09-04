import type { OverlayOrchestratorStore } from "../overlayOrchestratorStore";

export const selectOverlayQueue = (state: OverlayOrchestratorStore) => state.queue;

export const selectActiveOverlay = (state: OverlayOrchestratorStore) => state.queue.activeOverlay;
