import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import {
  HomepageReminderNudgeType,
  HomepageReminderData,
  TextFilterEducationExperimentVariant,
} from "../utils/types";
import {
  EducationExperimentAnalyticsVariants,
  EVENT_CONTEXT,
  EVENT_NAME,
  EVENT_PLATFORM,
  EventTypes,
} from "./eventConstants";

export type HomepageReminderEvent = {
  interactionType: EventTypes;
  reminderData: HomepageReminderData;
  userId: number | undefined;
  timestamp: number;
  timeToInteraction: number;
  isKidsVariant: boolean;
};

/**
 * Sends a home-page reminder interaction with the analytics metadata required for its nudge type.
 */
const sendReminderOfNormsEvent = (event: HomepageReminderEvent): void => {
  const { reminderData } = event;

  const isTextFilterEducation =
    reminderData.nudgeType === HomepageReminderNudgeType.TEXT_FILTER_EDUCATION;

  // We need to reformat the backend response to the one that matches the proto schema for just the TFE experiment.
  const experimentVariant = isTextFilterEducation
    ? reminderData.experimentVariant === TextFilterEducationExperimentVariant.CHANGE_OR_BLOCK
      ? EducationExperimentAnalyticsVariants.CHANGE_OR_BLOCK
      : EducationExperimentAnalyticsVariants.WARNING
    : reminderData.experimentVariant;

  const additionalProperties: Record<string, boolean | number | string | undefined> = {
    user_id: event.userId,
    source_intervention_id: reminderData.interventionId,
    reminder_number: reminderData.reminderNumber,
    timestamp_milliseconds: event.timestamp,
    time_to_interact_seconds: event.timeToInteraction,
    interaction: event.interactionType,
    platform: EVENT_PLATFORM,
    experiment_variant: experimentVariant,
  };

  if (isTextFilterEducation) {
    additionalProperties.content_variant = reminderData.contentVariant;
    additionalProperties.is_kids_variant = event.isKidsVariant;
  }

  sendEventWithTarget(
    EVENT_NAME,
    EVENT_CONTEXT,
    // additionalProperties
    additionalProperties,
    targetTypes.WWW,
  );
};

export default sendReminderOfNormsEvent;
