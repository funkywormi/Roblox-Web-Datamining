import React, { useRef, useState } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useTranslation } from "@rbx/core-scripts/react";
import { getTheme } from "@rbx/core-scripts/theme";
import useReminderOfNormsQuery from "../hooks/useReminderOfNormsQuery";
import { EventTypes } from "../services/eventConstants";
import sendReminderOfNormsEvent from "../services/sendReminderOfNormsEvent";
import getDisplayStringsFromReminderData from "../utils/getDisplayStringsFromReminderData";
import getTextFilterEducationDisplayStrings from "../utils/getTextFilterEducationDisplayStrings";
import { HomepageReminderNudgeType } from "../utils/types";
import ReminderOfNormsDialog from "./ReminderOfNormsDialog";
import TextFilterEducationDialog from "./TextFilterEducationDialog";

/**
 * Fetches and renders the applicable home-page reminder and records its interactions.
 */
const HomepageReminderDialog = (): React.JSX.Element | null => {
  const pageLoadTimestamp = useRef<number>(Date.now());

  const reminderData = useReminderOfNormsQuery();
  const { translate } = useTranslation();

  const [isDialogSeen, setIsDialogSeen] = useState<boolean>(false);

  const isKids = getTheme() === "kids";
  const currentUser = authenticatedUser();
  const userId = currentUser?.id ?? undefined;

  if (reminderData === null || !reminderData.shouldSurfaceReminder || isDialogSeen) {
    return null;
  }

  if (
    (!reminderData.nudgeType ||
      reminderData.nudgeType === HomepageReminderNudgeType.REMINDER_OF_NORMS) &&
    !reminderData.policyViolation
  ) {
    return null;
  }

  const handleInteraction = (interactionType: EventTypes): void => {
    const currentTimestamp = Date.now();
    sendReminderOfNormsEvent({
      interactionType,
      reminderData,
      userId,
      timestamp: currentTimestamp,
      timeToInteraction: (currentTimestamp - pageLoadTimestamp.current) / 1000, // Convert to seconds from milliseconds
      isKidsVariant: isKids,
    });

    setIsDialogSeen(true);
  };

  if (reminderData.nudgeType === HomepageReminderNudgeType.TEXT_FILTER_EDUCATION) {
    return (
      <TextFilterEducationDialog
        displayStrings={getTextFilterEducationDisplayStrings(reminderData, isKids, translate)}
        isKids={isKids}
        onClose={() => handleInteraction(EventTypes.CTA_CLICKED)}
      />
    );
  }

  return (
    <ReminderOfNormsDialog
      displayStrings={getDisplayStringsFromReminderData(reminderData, translate)}
      onClose={() => handleInteraction(EventTypes.CTA_CLICKED)}
      onDismiss={() => handleInteraction(EventTypes.DISMISSED)}
    />
  );
};

export default HomepageReminderDialog;
