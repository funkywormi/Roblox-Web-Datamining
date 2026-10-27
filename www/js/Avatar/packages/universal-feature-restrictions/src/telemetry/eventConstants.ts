export const EVENT_NAME = "InExperienceInterventionEvent";
export const EVENT_CONTEXT = "InExperienceInterventionEvent";

export enum EventType {
  ModalAppeared = "EVENT_MODAL_APPEARED",
  CtaClicked = "EVENT_CTA_CLICKED",
  DialogInterventionDismissSuccess = "EVENT_DIALOG_INTERVENTION_DISMISS_SUCCESS",
  DialogInterventionDismissFailed = "EVENT_DIALOG_INTERVENTION_DISMISS_FAILED",
  GetModerationDetailFailed = "EVENT_GET_MODERATION_DETAIL_FAILED",
  AppealClicked = "EVENT_APPEAL_CLICKED",
}

export const INTERVENTION_UFR_NUDGE = "INTERVENTION_UFR_NUDGE";
export const INTERVENTION_UFR_TIMEOUT = "INTERVENTION_UFR_TIMEOUT";
