export const MESSAGE_PAGE_SIZE = 20;

export const MESSAGE_TABS = {
  inbox: "inbox",
  sent: "sent",
  notifications: "notifications",
  archive: "archive",
} as const;

export const MESSAGE_MODULE_STATE = {
  list: "list",
  detail: "detail",
} as const;

export const ROBLOX_USER = {
  id: 1,
  name: "Roblox",
};

export const ROBLOX_LOGO_TEXT = "R";
export const USER_HANDLE_PREFIX = "@";
export const PREVIEW_SEPARATOR = " - ";
export const PAGE_SEPARATOR = " / ";

export const MESSAGE_EVENTS = {
  countChanged: "Roblox.Messages.CountChanged",
  messageSent: "Roblox.Messages.MessageSent",
} as const;

export const NEWS_OPEN_CONTENT_EVENT = "newsOpenContent";
export const NEWS_OPEN_CONTENT_CONTEXT = "click";
