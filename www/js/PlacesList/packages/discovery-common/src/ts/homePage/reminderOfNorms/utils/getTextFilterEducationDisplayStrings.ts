import { TranslateFunction } from "@rbx/core-scripts/react";
import { TextFilterEducationData, TextFilterEducationExperimentVariant } from "./types";

export type TextFilterEducationDisplayStrings = {
  dialogTitle: string;
  dialogBody: string;
  confirmationButtonLabel: string;
};

type BodyKeys = Readonly<Record<string, string> & { kind_word: string }>;

const KIDS_BODY_KEYS: BodyKeys = {
  kind_word: "Experiment.TextFilterEducation.Kids.Body.Respect",
  no_spam: "Experiment.TextFilterEducation.Kids.Body.Spam",
  no_personal_info: "Experiment.TextFilterEducation.Kids.Body.Pii",
};

const GENERAL_MODIFIED_BODY_KEYS: BodyKeys = {
  kind_word: "Experiment.TextFilterEducation.General.Body.Respect.Modified",
  no_spam: "Experiment.TextFilterEducation.General.Body.Spam.Modified",
  no_personal_info: "Experiment.TextFilterEducation.General.Body.Pii.Modified",
  no_sexual: "Experiment.TextFilterEducation.General.Body.Romance.Modified",
};

const GENERAL_WARNING_BODY_KEYS: BodyKeys = {
  kind_word: "Experiment.TextFilterEducation.General.Body.Respect.Warning",
  no_spam: "Experiment.TextFilterEducation.General.Body.Spam.Warning",
  no_personal_info: "Experiment.TextFilterEducation.General.Body.Pii.Warning",
  no_sexual: "Experiment.TextFilterEducation.General.Body.Romance.Warning",
};

/**
 * Returns localized Text Filter Education copy for the audience and experiment variants.
 */
function getTextFilterEducationDisplayStrings(
  reminderData: TextFilterEducationData,
  isKids: boolean,
  translate: TranslateFunction,
): TextFilterEducationDisplayStrings {
  const isModified =
    reminderData.experimentVariant === TextFilterEducationExperimentVariant.CHANGE_OR_BLOCK;

  if (isKids) {
    const dialogTitleKey = isModified
      ? "Experiment.TextFilterEducation.Kids.Title.Modified"
      : "Experiment.TextFilterEducation.Kids.Title.Warning";

    const dialogBodyKey =
      (reminderData.contentVariant && KIDS_BODY_KEYS[reminderData.contentVariant]) ??
      KIDS_BODY_KEYS.kind_word;

    return {
      dialogTitle: translate(dialogTitleKey),
      dialogBody: translate(dialogBodyKey),
      confirmationButtonLabel: translate("Action.OK"),
    };
  }

  const bodyKeys = isModified ? GENERAL_MODIFIED_BODY_KEYS : GENERAL_WARNING_BODY_KEYS;
  const fallbackBodyKey = isModified
    ? GENERAL_MODIFIED_BODY_KEYS.kind_word
    : GENERAL_WARNING_BODY_KEYS.kind_word;

  const dialogBodyKey =
    (reminderData.contentVariant && bodyKeys[reminderData.contentVariant]) ?? fallbackBodyKey;

  return {
    dialogTitle: translate(
      isModified
        ? "Experiment.TextFilterEducation.Kids.Title.Modified" // We purposely use the Kid's modified title for the general variant as well.
        : "Experiment.TextFilterEducation.General.Title.Warning",
    ),
    dialogBody: translate(dialogBodyKey),
    confirmationButtonLabel: translate("Action.OK"),
  };
}

export default getTextFilterEducationDisplayStrings;
