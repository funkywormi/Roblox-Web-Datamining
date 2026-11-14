import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { parseErrorCode } from "@rbx/core-scripts/http";
import { getNotificationStreamHost } from "../../notificationStreamData/streamHost";
import { streamPost, type StreamResponse } from "../../notificationStreamData/streamTransport";
import {
  NotificationActionApiResponse,
  ReportAbuseConfigResponse,
} from "../types/NotificationTemplateTypes";
import urlConstants from "../constants/urlConstants";
import {
  NotificationErrorCodes,
  reportNotificationErrorMessages,
} from "../constants/errorCodeConstants";

const updateNotificationAction = (
  streamId: string,
  actionId: string,
): Promise<StreamResponse<NotificationActionApiResponse>> => {
  const urlConfig = {
    retryable: true,
    url: urlConstants.notificationActionUrl(streamId, actionId),
    withCredentials: true,
  };
  return streamPost<NotificationActionApiResponse>(urlConfig, {});
};

const reportNotification = (notificationId?: string): Promise<unknown> => {
  if (!notificationId) {
    throw Error("No Notification ID to report");
  }
  const body = {
    notificationId,
  };
  return streamPost(urlConstants.reportNotificationUrl, body).catch((err: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- error codes are the api's numeric enum
    const errorCode = parseErrorCode(err) as NotificationErrorCodes;
    throw new Error(
      reportNotificationErrorMessages[errorCode] ?? reportNotificationErrorMessages.default,
    );
  });
};

const getReportAbuseConfig = (): Promise<ReportAbuseConfigResponse> => {
  return getNotificationStreamHost().getReportAbuseConfig();
};

const sendEventStreamEvent = (
  eventName: string,
  eventType: string,
  notificationParams: Record<string, string>,
): void => {
  sendEventWithTarget(eventName, eventType, notificationParams);
};

export { updateNotificationAction, reportNotification, sendEventStreamEvent, getReportAbuseConfig };
