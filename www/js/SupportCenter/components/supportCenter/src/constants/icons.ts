import { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import { CreatorTicketResponse, TicketCategory, UserTicketResponse } from "../types";

export const commentIcon: TTailwindIconClass = "icon-regular-speech-bubble-align-center";

export const closedIcon: TTailwindIconClass = "icon-regular-circle-check";

export const iconsByTicketCategory: Record<TicketCategory, TTailwindIconClass> = {
  [TicketCategory.Invalid]: "icon-regular-hand-two-arrows-horizontal",
  [TicketCategory.BugReport]: "icon-regular-hand-two-arrows-horizontal",
  [TicketCategory.DataRestoreRequest]: "icon-regular-hand-two-arrows-horizontal",
  [TicketCategory.PurchasingIssue]: "icon-regular-hand-two-arrows-horizontal",
  [TicketCategory.Other]: "icon-regular-hand-two-arrows-horizontal",
};

export const iconsByCreatorTicketResponse: Record<CreatorTicketResponse, TTailwindIconClass> = {
  [CreatorTicketResponse.Invalid]: "icon-regular-circle-question",
  [CreatorTicketResponse.RequestUserInformation]: commentIcon,
};

export const iconsByUserTicketResponse: Record<UserTicketResponse, TTailwindIconClass> = {
  [UserTicketResponse.SharedUserId]: "icon-regular-circle-i",
  [UserTicketResponse.DeclinedToShareUserId]: "icon-regular-circle-x",
};
