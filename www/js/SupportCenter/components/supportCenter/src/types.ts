export enum UserTicketStatus {
  Open = "USER_TICKET_STATUS_OPEN",
  NeedsInfo = "USER_TICKET_STATUS_NEEDS_INFO",
  Fixed = "USER_TICKET_STATUS_FIXED",
  WontFix = "USER_TICKET_STATUS_WONT_FIX",
  CantFix = "USER_TICKET_STATUS_CANT_FIX",
  RobloxIssue = "USER_TICKET_STATUS_ROBLOX_ISSUE",
  // TODO: list is not exhaustive, sync with creator-communication-service
}

export enum TicketCategory {
  Invalid = "TICKET_CATEGORY_INVALID",
  BugReport = "TICKET_CATEGORY_BUG_REPORT",
  DataRestoreRequest = "TICKET_CATEGORY_DATA_RESTORE_REQUEST",
  PurchasingIssue = "TICKET_CATEGORY_PURCHASING_ISSUE",
  Other = "TICKET_CATEGORY_OTHER",
  // TODO: list is not exhaustive, sync with creator-communication-service
}

export enum CreatorTicketResponse {
  Invalid = "TICKET_RESPONSE_INVALID",
  RequestUserInformation = "TICKET_RESPONSE_REQUEST_USER_INFORMATION",
  // TODO: list is not exhaustive, sync with creator-communication-service
}

export enum UserTicketResponse {
  SharedUserId = "USER_RESPONSE_SHARED_USER_ID",
  DeclinedToShareUserId = "USER_RESPONSE_DECLINED_TO_SHARE_USER_ID",
}

export enum ShareUserIdPreference {
  Invalid = 0,
  Share = 1,
  DoNotShare = 2,
}

export enum TicketMessageAuthorType {
  Anonymous = 0,
  User = 1,
  SupportTeam = 2,
}

export type Comment = {
  author: string;
  message: string;
  createTime: string;
  commentEnum?: CreatorTicketResponse;
  userCommentEnum?: UserTicketResponse;
};

export type UserTicketSummary = {
  id: string;
  category: TicketCategory;
  userTicketStatus: UserTicketStatus;
  title: string;
  createTime: string;
  updateTime: string;
  universeId: number;
  viewedByUser: boolean;
};

export type UserTicket = {
  summary: UserTicketSummary;
  comments: Comment[];
  metadata: Record<string, string>;
  assetIds?: number[];
};

export type ListUserTicketSummariesResponse = {
  userTicketSummaries: UserTicketSummary[];
  nextPageToken?: string;
};

export type GetTicketAsUserResponse = {
  userTicket: UserTicket;
};

export type SetShareUserIdPreferenceResponse = {
  universeId: number;
  ticketId: string;
  shareUserId: ShareUserIdPreference;
};

export type UpdateViewedByUserResponse = {
  universeId: number;
  ticketId: string;
  viewedByUser: boolean;
};

export class TicketActionError extends Error {}
