import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { trackCounter } from "../observability";

const EVENT_NAME = "profileFrameEdit";
const EVENT_CONTEXT = "EditUserProfile";

export enum ProfileFrameEventType {
  DialogOpened = "dialog_opened",
  FrameSelected = "frame_selected",
  FrameSaved = "frame_saved",
  UpsellClicked = "upsell_clicked",
}

export type ProfileFrameEventMeta = {
  userId?: number;
  frameId?: string;
  hasPlus?: boolean;
};

const buildCustomFields = (
  eventType: ProfileFrameEventType,
  meta?: ProfileFrameEventMeta,
): Record<string, string | number | undefined> => ({
  eventType,
  userId: meta?.userId,
  frameId: meta?.frameId,
  // event-stream custom fields are string|number, so coerce the boolean to 0/1.
  hasPlus: meta?.hasPlus === undefined ? undefined : Number(meta.hasPlus),
});

export const sendProfileFrameEvent = (
  eventType: ProfileFrameEventType,
  meta?: ProfileFrameEventMeta,
): void => {
  try {
    sendEventWithTarget(
      EVENT_NAME,
      EVENT_CONTEXT,
      buildCustomFields(eventType, meta),
      targetTypes.WWW,
    );
  } catch {
    // Telemetry must never break the edit flow.
  }
};

export const trackProfileFrameDialogOpened = (meta?: ProfileFrameEventMeta) => {
  trackCounter("Frames_DialogOpened", { hasPlus: String(Boolean(meta?.hasPlus)) });
  sendProfileFrameEvent(ProfileFrameEventType.DialogOpened, meta);
};

export const trackProfileFrameFrameSelected = (meta?: ProfileFrameEventMeta) => {
  trackCounter("Frames_FrameSelected", { hasPlus: String(Boolean(meta?.hasPlus)) });
  sendProfileFrameEvent(ProfileFrameEventType.FrameSelected, meta);
};

export const trackProfileFrameFrameSaved = (meta?: ProfileFrameEventMeta) => {
  trackCounter("Frames_FrameSaved");
  sendProfileFrameEvent(ProfileFrameEventType.FrameSaved, meta);
};

export const trackProfileFrameUpsellClicked = (meta?: ProfileFrameEventMeta) => {
  trackCounter("Frames_UpsellClicked");
  sendProfileFrameEvent(ProfileFrameEventType.UpsellClicked, meta);
};
