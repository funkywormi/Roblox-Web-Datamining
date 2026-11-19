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

const inFlightMessagePages = new Map<string, Promise<MessagePage>>();

// Loads one GET /v1/messages page, sharing an in-flight request with identical parameters. Repeat
// navigation to a page that is still loading, such as a double-click on Next, then sends one
// request, which matters because the endpoint is rate limited per user.
const getMessagePage = (
  params: Record<string, string | number | boolean>,
): Promise<MessagePage> => {
  const key = JSON.stringify(params);
  const inFlight = inFlightMessagePages.get(key);
  if (inFlight) {
    return inFlight;
  }

  const request = transport
    .get<RawMessagePage>(messageUrlConfig(endpoint("/v1/messages"), true), params)
    .then(normalizeMessagePage)
    .finally(() => {
      if (inFlightMessagePages.get(key) === request) {
        inFlightMessagePages.delete(key);
      }
    });
  inFlightMessagePages.set(key, request);
  return request;
};

export const getMessages = (tabName: MessageTab, pageNumber: number): Promise<MessagePage> =>
  getMessagePage({
    pageNumber,
    pageSize: MESSAGE_PAGE_SIZE,
    messageTab: tabName,
  });

/**
 * Loads one cursor-mode page of `tabName`. A null `pageToken` loads the first page, as does the
 * response's `firstPageToken`. The response
 * carries `cursorPagination` with a numbered page window whose tokens open the neighboring pages.
 * Servers without cursor mode ignore these parameters and return the first offset page, which
 * normalizes with `cursorPagination: null`.
 */
export const getMessagesByPageToken = (
  tabName: MessageTab,
  pageToken: string | null,
): Promise<MessagePage> =>
  getMessagePage({
    pageSize: MESSAGE_PAGE_SIZE,
    messageTab: tabName,
    useCursor: true,
    ...(pageToken ? { pageToken } : {}),
  });

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

// Page requests sent before a read-state or archive write settles may return the messages as they
// were before the write, so loads that start after the write must not join them.
const invalidateMessagePages = () => {
  inFlightMessagePages.clear();
};

export const markMessagesRead = (messageIds: number[], markRead: boolean): Promise<unknown> =>
  transport
    .post(
      messageUrlConfig(endpoint(markRead ? "/v1/messages/mark-read" : "/v1/messages/mark-unread")),
      { messageIds },
    )
    .finally(invalidateMessagePages);

export const setArchiveMessages = (messageIds: number[], archive: boolean): Promise<unknown> =>
  transport
    .post(messageUrlConfig(endpoint(archive ? "/v1/messages/archive" : "/v1/messages/unarchive")), {
      messageIds,
    })
    .finally(invalidateMessagePages);

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
