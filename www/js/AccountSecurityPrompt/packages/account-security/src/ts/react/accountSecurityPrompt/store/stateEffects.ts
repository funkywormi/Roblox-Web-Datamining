import { EventService } from "../services/eventService";
import { trackPromptModalViewed } from "../../observability";
import ModalState from "./modalState";

/**
 * Runs side-effects related to modal state changes.
 */
export const runModalStateChangeEffect = (
  eventService: EventService,
  promptType: string,
  modalState: ModalState,
  lastModalState: ModalState | null,
): void => {
  // No modal state change; return early.
  if (modalState === lastModalState) {
    return;
  }

  // Event: A modal state was viewed (should capture the initial `NONE` state on page load).
  eventService.sendModalStateViewedEvent(modalState);
  if (modalState !== ModalState.NONE) {
    trackPromptModalViewed(promptType, modalState);
  }
};
