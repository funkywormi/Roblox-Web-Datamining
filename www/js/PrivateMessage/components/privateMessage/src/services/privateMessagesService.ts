import environmentUrls from "@rbx/environment-urls";
import { userId } from "@rbx/core-scripts/meta/user";
import { MESSAGE_PAGE_SIZE, MESSAGE_TABS } from "../constants";
import { normalizeMessage, normalizeMessagePage } from "../utils/messageUtils";
import transport, { type MessageUrlConfig } from "./privateMessagesRequests";
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

const messageUrlConfig = (url: string, noCache = false): MessageUrlConfig => ({
  url,
  noCache,
  retryable: noCache,
  withCredentials: true,
});

export const getPrivateMessagesRules = (): Promise<PrivateMessagesRules> =>
  transport.getGuacBundle<PrivateMessagesRules>("private-messages-ui");

export const getMessages = async (
  tabName: MessageTab,
  pageNumber: number,
): Promise<MessagePage> => {
  const data = await transport.get<RawMessagePage>(
    messageUrlConfig(endpoint("/v1/messages"), true),
    {
      pageNumber,
      pageSize: MESSAGE_PAGE_SIZE,
      messageTab: tabName,
    },
  );

  return normalizeMessagePage(data);
};

export const getAnnouncements = async (): Promise<MessagePage> => {
  const data = await transport.get<RawMessagePage>(
    messageUrlConfig(endpoint("/v1/announcements"), true),
  );

  return normalizeMessagePage(data);
};

export const getAnnouncementsMetadata = (): Promise<AnnouncementsMetadata> =>
  transport.get<AnnouncementsMetadata>(
    messageUrlConfig(endpoint("/v1/announcements/metadata"), true),
  );

export const getMessageDetailById = async (messageId: number): Promise<MessageItem> => {
  const data = await transport.get<RawMessage>(
    messageUrlConfig(endpoint(`/v1/messages/${messageId}`), true),
  );

  return normalizeMessage(data);
};

export const updateMessages = (tabName: MessageTab, pageNumber: number): Promise<MessagePage> =>
  tabName === MESSAGE_TABS.notifications ? getAnnouncements() : getMessages(tabName, pageNumber);

export const markMessagesRead = (messageIds: number[], markRead: boolean): Promise<unknown> =>
  transport.post(
    messageUrlConfig(endpoint(markRead ? "/v1/messages/mark-read" : "/v1/messages/mark-unread")),
    { messageIds },
  );

export const setArchiveMessages = (messageIds: number[], archive: boolean): Promise<unknown> =>
  transport.post(
    messageUrlConfig(endpoint(archive ? "/v1/messages/archive" : "/v1/messages/unarchive")),
    { messageIds },
  );

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
  const data = await transport.post<SendMessageResult>(
    messageUrlConfig(endpoint("/v1/messages/send")),
    {
      userId: userId() ?? 0,
      subject,
      body,
      recipientId,
      replyMessageId,
      includePreviousMessage,
    },
  );

  if (data.success === false) {
    throw getSendMessageError(data);
  }

  return data;
};
