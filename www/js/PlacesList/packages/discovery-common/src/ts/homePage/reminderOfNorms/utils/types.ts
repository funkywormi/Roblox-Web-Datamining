export enum HomepageReminderNudgeType {
  REMINDER_OF_NORMS = "REMINDER_OF_NORMS",
  TEXT_FILTER_EDUCATION = "TEXT_FILTER_EDUCATION",
}

export enum TextFilterEducationExperimentVariant {
  CHANGE_OR_BLOCK = "change_or_block",
  WARNING = "warning",
}

type BaseReminderData = {
  shouldSurfaceReminder: true;
  interventionId: string;
  experimentVariant: string;
};

export type ReminderOfNormsData = BaseReminderData & {
  nudgeType?: HomepageReminderNudgeType.REMINDER_OF_NORMS;
  policyViolation: string;
  reminderNumber: number;
};

export type TextFilterEducationData = BaseReminderData & {
  nudgeType: HomepageReminderNudgeType.TEXT_FILTER_EDUCATION;
  experimentVariant: TextFilterEducationExperimentVariant;
  contentVariant?: string;
  reminderNumber?: number;
};

export type HomepageReminderData = ReminderOfNormsData | TextFilterEducationData;
export type HomepageReminderResponse =
  | HomepageReminderData
  | {
      shouldSurfaceReminder: false;
    };
