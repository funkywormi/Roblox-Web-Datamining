import { TranslateFunction } from "@rbx/core-scripts/react";
import { ReminderOfNormsData } from "./types";

export type ReminderDisplayStringsType = {
  dialogTitle: string;
  dialogBodyAbuseType: string;
  dialogBodyGuidelineReminder: string;
  confirmationButtonLabel: string;
};

/**
 * Returns the localized copy for a Reminder of Norms dialog.
 */
function getDisplayStringsFromReminderData(
  reminderData: ReminderOfNormsData,
  translate: TranslateFunction,
): ReminderDisplayStringsType {
  const { policyViolation } = reminderData;
  return {
    dialogTitle: translate("Experiment.Reminders.Title"),
    dialogBodyAbuseType: translate("Experiment.Reminders.BodyShared", {
      policy_violation: translate(policyViolation),
    }),
    dialogBodyGuidelineReminder: translate("Experiment.Reminders.BodyWarningVariant"),
    confirmationButtonLabel: translate("Experiment.Reminders.Button"),
  };
}

export default getDisplayStringsFromReminderData;
