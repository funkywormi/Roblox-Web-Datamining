import environmentUrls from "@rbx/environment-urls";
import { userId } from "@rbx/core-scripts/meta/user";
import { MESSAGE_PAGE_SIZE, MESSAGE_TABS } from "../constants";
import { getStatusCode } from "../utils/getStatusCode";
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

/**
 * Loads one cursor-mode page of `tabName`. A null `pageToken` loads the first page, as does the
 * response's `firstPageToken`. The response
 * carries `cursorPagination` with a numbered page window whose tokens open the neighboring pages.
 * Servers without cursor mode ignore these parameters and return the first offset page, which
 * normalizes with `cursorPagination: null`.
 */
export const getMessagesByPageToken = async (
  tabName: MessageTab,
  pageToken: string | null,
): Promise<MessagePage> => {
  const data = await transport.get<RawMessagePage>(
    messageUrlConfig(endpoint("/v1/messages"), true),
    {
      pageSize: MESSAGE_PAGE_SIZE,
      messageTab: tabName,
      useCursor: true,
      ...(pageToken ? { pageToken } : {}),
    },
  );

  return normalizeMessagePage(data);
};

/**
 * Whether `error` is the 400 that GET /v1/messages returns for a page token it cannot verify or
 * whose cursor the service rejects, for example a token edited in the URL or signed with a
 * rotated key. Accepts the rejection from either transport: the Axios response on .NET, or the
 * error wrapping a core-lib `HttpError` on Next.js.
 */
export const isInvalidPageTokenError = (error: unknown): boolean => getStatusCode(error) === "400";

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
