import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { TranslateFunction, useTranslation } from "@rbx/core-scripts/react";
import useTicketActionConfig, { TicketActionPlacement } from "./useTicketActionConfig";
import { TicketActivityProps } from "../components/TicketActivity";
import {
  closedIcon,
  commentIcon,
  iconsByTicketCategory,
  iconsByUserTicketResponse,
} from "../constants/icons";
import {
  Comment,
  TicketCategory,
  TicketMessageAuthorType,
  UserTicket,
  UserTicketResponse,
  UserTicketStatus,
} from "../types";
import { GameDetailsResponse } from "../services/gamesService";

const TICKET_CATEGORY_LABEL_TRANSLATION_KEY: Record<TicketCategory, string> = {
  [TicketCategory.Invalid]: "Label.TicketCategory.Invalid",
  [TicketCategory.BugReport]: "Label.TicketCategory.BugReport",
  [TicketCategory.DataRestoreRequest]: "Label.TicketCategory.DataRestoreRequest",
  [TicketCategory.PurchasingIssue]: "Label.TicketCategory.PurchasingIssue",
  [TicketCategory.Other]: "Label.TicketCategory.Other",
};

const TICKET_CLOSED_STATUSES = [
  UserTicketStatus.Fixed,
  UserTicketStatus.WontFix,
  UserTicketStatus.CantFix,
  UserTicketStatus.RobloxIssue,
];

const getActivityAuthorType = (
  authorId: string,
  currentUserId: number,
): TicketMessageAuthorType => {
  if (!authorId || authorId === "0") {
    return TicketMessageAuthorType.Anonymous;
  }
  if (parseInt(authorId, 10) === currentUserId) {
    return TicketMessageAuthorType.User;
  }
  return TicketMessageAuthorType.SupportTeam;
};

type AuthorData = {
  id: number;
  name: string;
  type: TicketMessageAuthorType;
};

const getActivityAuthorData = ({
  authorId,
  translate,
}: {
  authorId: string;
  translate: TranslateFunction;
}): AuthorData => {
  const authedUser = authenticatedUser();
  const authorType = getActivityAuthorType(authorId, authedUser?.id ?? 0);

  const currentUserName = authedUser?.displayName ?? translate("Label.You");

  const authorName =
    authorType === TicketMessageAuthorType.Anonymous
      ? translate("Label.Anonymous")
      : authorType === TicketMessageAuthorType.SupportTeam
        ? translate("Label.SupportTeam")
        : currentUserName;

  return {
    id: parseInt(authorId, 10),
    type: authorType,
    name: authorName,
  };
};

const getActivityHeading = ({
  comment,
  authorData,
  gameDetails,
  translate,
}: {
  comment: Comment;
  authorData: AuthorData;
  gameDetails?: GameDetailsResponse | null;
  translate: TranslateFunction;
}) => {
  if (comment.userCommentEnum === UserTicketResponse.SharedUserId) {
    return translate("Message.SharedUserId");
  }
  if (comment.userCommentEnum === UserTicketResponse.DeclinedToShareUserId) {
    return translate("Message.DeclinedToShareUserId");
  }

  const supportTeamFullName = translate("Label.SupportTeamFull", {
    gameName: gameDetails?.name ?? translate("Label.UnknownGame"),
  });

  return translate("Message.SentAMessage", {
    author:
      authorData.type === TicketMessageAuthorType.SupportTeam
        ? supportTeamFullName
        : translate("Label.You"),
  });
};

const useTicketActivityList = (ticket: UserTicket, gameDetails?: GameDetailsResponse | null) => {
  const { translate } = useTranslation();
  const actionConfig = useTicketActionConfig(ticket);

  const translatedTicketType = translate(
    TICKET_CATEGORY_LABEL_TRANSLATION_KEY[ticket.summary.category],
  );

  const initialComment = ticket.comments[0];

  const initialActivity = {
    iconName: iconsByTicketCategory[ticket.summary.category],
    heading: translate("Message.SubmittedATicket", {
      author: translate("Label.You"),
      ticketType: translatedTicketType.toLocaleLowerCase(),
    }),
    date: new Date(ticket.summary.createTime),
    author: getActivityAuthorData({ authorId: initialComment?.author ?? "0", translate }),
    message: initialComment?.message,
    assetIds: ticket.assetIds,
    gameName: gameDetails?.name,
    metadata: ticket.metadata,
  };

  const responseActivities = ticket.comments.slice(1).map((comment, index, arr) => {
    const isLastComment = index === arr.length - 1;
    const commentHasControl =
      actionConfig?.placement === TicketActionPlacement.LastComment && isLastComment;

    const authorData = getActivityAuthorData({ authorId: comment.author, translate });
    const heading = getActivityHeading({ comment, authorData, gameDetails, translate });

    const iconName = comment.userCommentEnum
      ? iconsByUserTicketResponse[comment.userCommentEnum]
      : commentIcon;

    return {
      iconName,
      heading,
      author: authorData,
      date: new Date(comment.createTime),
      message: comment.message,
      controls: commentHasControl && actionConfig.renderControl(),
    };
  });

  const activities: TicketActivityProps[] = [initialActivity, ...responseActivities];

  const isTicketClosed = TICKET_CLOSED_STATUSES.includes(ticket.summary.userTicketStatus);
  if (isTicketClosed) {
    activities.push({
      iconName: closedIcon,
      heading: translate("Message.TicketClosed", { ticketType: translatedTicketType }),
      date: new Date(ticket.summary.updateTime),
    });
  } else if (actionConfig?.placement === TicketActionPlacement.ActivityList) {
    activities.push({
      iconName: actionConfig.iconName ?? commentIcon,
      heading: actionConfig.heading ?? "",
      controls: actionConfig.renderControl(),
    });
  }

  return activities;
};

export default useTicketActivityList;
