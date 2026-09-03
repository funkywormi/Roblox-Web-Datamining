import International from "@rbx/core-scripts/intl";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { escapeHtml } from "@rbx/core-scripts/format/string";
import { MESSAGE_EVENTS, ROBLOX_USER } from "../constants";
import type {
  MessageItem,
  MessagePage,
  MessageUser,
  RawMessage,
  RawMessagePage,
  RawUser,
} from "../types";

const intl = new International();
const dateFormatter = intl.getDateTimeFormatter();

const coalesce = <T>(...values: (T | null | undefined)[]): T | undefined =>
  values.find(value => value !== undefined && value !== null);

export const getRobloxUser = (): MessageUser => ({
  id: ROBLOX_USER.id,
  name: ROBLOX_USER.name,
  displayName: ROBLOX_USER.name,
  hasVerifiedBadge: true,
  profileLink: getAbsoluteUrl(`/users/${ROBLOX_USER.id}/profile`),
});

export const normalizeUser = (rawUser?: RawUser): MessageUser => {
  const id = coalesce(rawUser?.id, rawUser?.UserId, ROBLOX_USER.id) ?? ROBLOX_USER.id;
  const name = coalesce(rawUser?.name, rawUser?.UserName, ROBLOX_USER.name) ?? ROBLOX_USER.name;
  const displayName = coalesce(rawUser?.displayName, rawUser?.DisplayName, name) ?? name;
  return {
    id,
    name: escapeHtml(name),
    displayName,
    hasVerifiedBadge: Boolean(
      coalesce(rawUser?.hasVerifiedBadge, rawUser?.HasVerifiedBadge, false),
    ),
    profileLink: getAbsoluteUrl(`/users/${id}/profile`),
  };
};

export const buildAbuseReportUrl = (messageId: number): string => {
  const redirectUrl = getAbsoluteUrl("/my/messages/");
  return getAbsoluteUrl(`/AbuseReport/message?ID=${messageId}&RedirectUrl=${redirectUrl}`);
};

export const normalizeMessage = (rawMessage: RawMessage): MessageItem => {
  const id = coalesce(rawMessage.id, rawMessage.Id, 0) ?? 0;
  const sender = normalizeUser(coalesce(rawMessage.sender, rawMessage.Sender));
  const recipient = normalizeUser(coalesce(rawMessage.recipient, rawMessage.Recipient));

  return {
    id,
    sender,
    recipient,
    subject: coalesce(rawMessage.subject, rawMessage.Subject, "") ?? "",
    body: coalesce(rawMessage.body, rawMessage.Body, "") ?? "",
    created: coalesce(rawMessage.created, rawMessage.Created, "") ?? "",
    updated: coalesce(rawMessage.updated, rawMessage.Updated),
    isRead: Boolean(coalesce(rawMessage.isRead, rawMessage.IsRead, false)),
    isSystemMessage: Boolean(
      coalesce(rawMessage.isSystemMessage, rawMessage.IsSystemMessage, false),
    ),
    isReportAbuseDisplayed: Boolean(
      coalesce(rawMessage.isReportAbuseDisplayed, rawMessage.IsReportAbuseDisplayed, false),
    ),
    abuseReportUrl: buildAbuseReportUrl(id),
  };
};

export const normalizeMessagePage = (rawPage: RawMessagePage): MessagePage => {
  const collection = coalesce(rawPage.collection, rawPage.Collection, []) ?? [];

  return {
    pageNumber: coalesce(rawPage.pageNumber, rawPage.PageNumber, 0) ?? 0,
    totalPages: coalesce(rawPage.totalPages, rawPage.TotalPages, 1) ?? 1,
    totalCollectionSize:
      coalesce(rawPage.totalCollectionSize, rawPage.TotalCollectionSize, collection.length) ??
      collection.length,
    collection: collection.map(normalizeMessage),
  };
};

export const htmlToPlainText = (html: string): string => {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element.textContent || element.innerText || "";
};

const escapeHtmlAttribute = (value: string): string =>
  value.replace(/[&"]/g, character => (character === "&" ? "&amp;" : "&quot;"));

export const linkifyMessageBody = (body: string): string => {
  const urlPattern = /(https?:\/\/[^\s<]+)/g;
  let lastIndex = 0;
  let result = "";

  body.replace(urlPattern, (url, _match, offset: number) => {
    result += escapeHtml(body.slice(lastIndex, offset));
    result += `<a href="${escapeHtmlAttribute(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a>`;
    lastIndex = offset + url.length;
    return url;
  });

  result += escapeHtml(body.slice(lastIndex));
  return result.replace(/\n/g, "<br />");
};

export const formatListDate = (created: string): string => {
  const date = new Date(created);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const dateString =
    date.getFullYear() === new Date().getFullYear()
      ? dateFormatter.getCustomDateTime(date, { month: "short", day: "numeric" })
      : dateFormatter.getShortDate(date);

  return `${dateString} | ${dateFormatter.getCustomDateTime(date, {
    hour: "numeric",
    minute: "numeric",
  })}`;
};

export const formatDetailDate = (created: string): string => {
  const date = new Date(created);
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.getFullDate(date);
};

export const dispatchLegacyMessageEvent = (
  eventName: (typeof MESSAGE_EVENTS)[keyof typeof MESSAGE_EVENTS],
): void => {
  document.dispatchEvent(new Event(eventName));
};

export const shouldShowSystemUser = (message: MessageItem, activeTab: string): boolean =>
  activeTab !== "sent" && message.sender.id === ROBLOX_USER.id;
