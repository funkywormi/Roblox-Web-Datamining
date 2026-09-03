import React from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import { useTranslation } from "@rbx/core-scripts/react";
import { FeedbackBanner } from "@rbx/foundation-ui";
import { CreatorTicketResponse, UserTicket, UserTicketStatus } from "../types";
import TicketTextInputControl from "../components/controls/TicketTextInputControl";
import TicketAcceptDeclineControl from "../components/controls/TicketAcceptDeclineControl";
import { commentIcon } from "../constants/icons";
import useTicketActions from "./useTicketActions";

const MAX_USER_REPLIES_BEFORE_CREATOR_ACTION = 5;

export enum TicketActionPlacement {
  ActivityList = 0,
  LastComment = 1,
}

export type TicketActionConfig = {
  placement: TicketActionPlacement;
  heading?: string;
  iconName?: TTailwindIconClass;
  renderControl: () => React.ReactNode;
};

const useTicketActionConfig = (ticket: UserTicket): TicketActionConfig | null => {
  const { translate } = useTranslation();
  const { submitResponse, acceptShareUserInfo, declineShareUserInfo } = useTicketActions(ticket);

  const lastComment = ticket.comments.at(-1);

  const freeResponseConfig = {
    placement: TicketActionPlacement.ActivityList,
    iconName: commentIcon,
    heading: translate("Label.ReplyTo", {
      targetName: translate("Label.SupportTeam").toLocaleLowerCase(),
    }),
    renderControl: () => (
      <TicketTextInputControl
        minLength={10}
        maxLength={1000}
        placeholder={translate("Label.EnterMessage")}
        onSubmit={submitResponse}
      />
    ),
  };

  const currentUserId = authenticatedUser()?.id ?? 0;

  let userRepliesInARowCount = 0;
  for (let i = ticket.comments.length - 1; i >= 0; i -= 1) {
    const comment = ticket.comments[i];
    const author = comment?.author ?? "";
    if (author === "" || parseInt(author, 10) === currentUserId) {
      userRepliesInARowCount += 1;
    } else {
      break;
    }
  }

  if (userRepliesInARowCount >= MAX_USER_REPLIES_BEFORE_CREATOR_ACTION) {
    return {
      placement: TicketActionPlacement.ActivityList,
      iconName: commentIcon,
      renderControl: () => (
        <FeedbackBanner
          variant="Emphasis"
          title={translate("Message.MessageLimitReached")}
          description={translate("Description.ConversationLocked")}
        />
      ),
    };
  }

  switch (ticket.summary.userTicketStatus) {
    case UserTicketStatus.Open:
      return freeResponseConfig;
    case UserTicketStatus.NeedsInfo:
      if (lastComment?.commentEnum === CreatorTicketResponse.RequestUserInformation) {
        return {
          placement: TicketActionPlacement.LastComment,
          renderControl: () => (
            <TicketAcceptDeclineControl
              acceptText={translate("Action.Share")}
              onAccept={acceptShareUserInfo}
              onDecline={declineShareUserInfo}
            />
          ),
        };
      }
      return freeResponseConfig;
    case UserTicketStatus.Fixed:
    case UserTicketStatus.WontFix:
    case UserTicketStatus.CantFix:
    case UserTicketStatus.RobloxIssue:
    default:
      return null;
  }
};

export default useTicketActionConfig;
