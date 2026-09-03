import environmentUrls from "@rbx/environment-urls";
import { get, post } from "@rbx/core-scripts/http";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { userId } from "@rbx/core-scripts/meta/user";
import { MESSAGE_PAGE_SIZE, MESSAGE_TABS } from "../constants";
import { normalizeMessage, normalizeMessagePage } from "../utils/messageUtils";
import type {
  AnnouncementsMetadata,
  MessageItem,
  MessagePage,
  MessageTab,
  PrivateMessagesRules,
  RawMessage,
  RawMessagePage,
} from "../types";

const endpoint = (path: string) => `${environmentUrls.privateMessagesApi}${path}`;

const messageUrlConfig = (url: string, noCache = false) => ({
  url,
  noCache,
  retryable: noCache,
  withCredentials: true,
});

export const getPrivateMessagesRules = (): Promise<PrivateMessagesRules> => {
  const params = new URLSearchParams();
  params.append("version", "1");
  return callBehaviour<PrivateMessagesRules>("private-messages-ui", params);
};

export const getMessages = async (
  tabName: MessageTab,
  pageNumber: number,
): Promise<MessagePage> => {
  const response = await get<RawMessagePage>(messageUrlConfig(endpoint("/v1/messages"), true), {
    pageNumber,
    pageSize: MESSAGE_PAGE_SIZE,
    messageTab: tabName,
  });

  return normalizeMessagePage(response.data);
};

export const getAnnouncements = async (): Promise<MessagePage> => {
  const response = await get<RawMessagePage>(
    messageUrlConfig(endpoint("/v1/announcements"), true),
    undefined,
  );

  return normalizeMessagePage(response.data);
};

export const getAnnouncementsMetadata = async (): Promise<AnnouncementsMetadata> => {
  const response = await get<AnnouncementsMetadata>(
    messageUrlConfig(endpoint("/v1/announcements/metadata"), true),
    undefined,
  );

  return response.data;
};

export const getMessageDetailById = async (messageId: number): Promise<MessageItem> => {
  const response = await get<RawMessage>(
    messageUrlConfig(endpoint(`/v1/messages/${messageId}`), true),
    undefined,
  );

  return normalizeMessage(response.data);
};

export const updateMessages = (tabName: MessageTab, pageNumber: number): Promise<MessagePage> =>
  tabName === MESSAGE_TABS.notifications ? getAnnouncements() : getMessages(tabName, pageNumber);

export const markMessagesRead = (messageIds: number[], markRead: boolean): Promise<unknown> =>
  post(
    messageUrlConfig(endpoint(markRead ? "/v1/messages/mark-read" : "/v1/messages/mark-unread")),
    { messageIds },
  );

export const setArchiveMessages = (messageIds: number[], archive: boolean): Promise<unknown> =>
  post(messageUrlConfig(endpoint(archive ? "/v1/messages/archive" : "/v1/messages/unarchive")), {
    messageIds,
  });

type SendMessageResult = {
  success?: boolean;
  message?: string;
  errors?: { message?: string }[];
};

const getSendMessageError = (result: SendMessageResult): Error => {
  if (result.message) {
    return new Error(result.message);
  }

  const firstError = result.errors?.[0]?.message;
  return new Error(firstError ?? "Unknown error");
};

export const sendMessage = async ({
  subject,
  body,
  recipientId,
  replyMessageId,
  includePreviousMessage,
}: {
  subject: string;
  body: string;
  recipientId: number;
  replyMessageId: number;
  includePreviousMessage: boolean;
}): Promise<SendMessageResult> => {
  const response = await post<SendMessageResult>(messageUrlConfig(endpoint("/v1/messages/send")), {
    userId: userId() ?? 0,
    subject,
    body,
    recipientId,
    replyMessageId,
    includePreviousMessage,
  });

  if (response.data.success === false) {
    throw getSendMessageError(response.data);
  }

  return response.data;
};
