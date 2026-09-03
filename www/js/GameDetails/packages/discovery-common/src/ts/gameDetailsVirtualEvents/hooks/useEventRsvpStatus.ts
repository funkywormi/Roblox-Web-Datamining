import { useCallback, useMemo, useState } from "react";
import { SystemFeedbackService } from "@rbx/core-ui";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { navigateToLoginWithRedirect } from "@rbx/navigation";
import AnalyticsEvents from "../utils/analytics";
import { postRsvpStatus, RSVP_STATUS, VirtualEvent } from "../services/services";
import { getTranslationStringForKeyWithFallback } from "../constants/constants";
import { getLocalizedDateString, tryParseDate } from "../utils/utils";
import { TDiscoverySessionInfo } from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";

const useEventRsvpStatus = (
  eventItem: VirtualEvent,
  referralSessionInfo: TDiscoverySessionInfo,
  referralPage: PageContext | undefined,
  systemFeedbackService: SystemFeedbackService,
  translate: TranslateFunction,
): {
  userHasRsvpd: boolean;
  totalRsvps: number;
  handleToggleRsvpClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
} => {
  const [userHasRsvpd, setUserHasRsvpd] = useState(eventItem.userRsvpStatus === RSVP_STATUS.GOING);

  // We no longer fetch RSVPs here, it was wasteful and we were using the data in the analytics events.
  const [totalRsvps] = useState<number>(0);

  const rsvpSuccessMessage = useMemo(() => {
    const dateString = getLocalizedDateString(tryParseDate(eventItem.eventTime.startUtc));
    return getTranslationStringForKeyWithFallback(translate, "reminderSetForEventTime", {
      eventName: eventItem.displayTitle || eventItem.title,
      eventTime: dateString,
    });
  }, [eventItem.eventTime.startUtc, eventItem.displayTitle, eventItem.title, translate]);

  const handleToggleRsvpClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      const newRsvpStatus = userHasRsvpd ? RSVP_STATUS.NOT_GOING : RSVP_STATUS.GOING;

      e.preventDefault();
      e.stopPropagation();
      AnalyticsEvents.sendVirtualEventRSVPFromExpDetailsEvent(
        eventItem.id,
        eventItem.universeId,
        referralSessionInfo,
        referralPage,
        newRsvpStatus,
        totalRsvps,
      );
      if (!authenticatedUser()?.isAuthenticated) {
        Roblox.Dialog.open({
          titleText: translate("Heading.LogInToRsvp"),
          bodyContent: translate("Description.LogInToRsvp"),
          onAccept: navigateToLoginWithRedirect,
          acceptColor: "btn-primary-md",
          acceptText: translate("Action.Dialog.Login"),
          declineText: translate("Action.Dialog.Close"),
        });
        return;
      }
      try {
        await postRsvpStatus(eventItem.id, newRsvpStatus);
        setUserHasRsvpd(newRsvpStatus === RSVP_STATUS.GOING);

        if (newRsvpStatus === RSVP_STATUS.GOING) {
          systemFeedbackService.success(rsvpSuccessMessage);
        }
      } catch {
        systemFeedbackService.warning(
          getTranslationStringForKeyWithFallback(translate, "networkError"),
        );
      }
    },
    [
      eventItem,
      rsvpSuccessMessage,
      systemFeedbackService,
      referralSessionInfo,
      referralPage,
      translate,
      userHasRsvpd,
      totalRsvps,
    ],
  );

  return { userHasRsvpd, totalRsvps, handleToggleRsvpClick };
};

export default useEventRsvpStatus;
