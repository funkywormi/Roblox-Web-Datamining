/* eslint-disable camelcase -- EventStream guidance suggest camel_case for parameters */
import { EventStream } from "@rbx/core-scripts/legacy/Roblox";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { getNewRunId } from "../util/runId";
import { getErrorMessage, getHttpStatus, getResponseBody } from "../util/errorMsg";
import { CLIENT_VERSION } from "../version";

export const PLATFORM = "web";

export enum EventName {
  /**
   * The abuse report dialog is opened.
   */
  OpenDialog = "OpenDialog",
  /**
   * The abuse report dialog is early closed.
   * e.g. close before submission.
   */
  EarlyClose = "EarlyClose",
  /**
   * The abuse report dialog is closed after submission.
   */
  Close = "Close",
  Submit = "Submit",
  SubmitSuccess = "SubmitSuccess",
  SubmitFail = "SubmitFail",
  BackAction = "BackAction",
  /**
   * We "finished"/moved on from a node (e.g. user clicked next/back/close button)
   */
  NodeDone = "NodeDone",
  // Node specific events
  SelectItem = "SelectItem",
  IsUserBlockAvailable = "IsUserBlockAvailable",
  DidBlockUser = "DidBlockUser",
  DidUnblockUser = "DidUnblockUser",
  HelplineShown = "HelplineShown",
  HelplineOpened = "HelplineOpened",
  Error = "Error",
}

/**
 * Common properties for all analytics events.
 */
export type CommonAnalyticsProps = {
  /**
   * A random UUID for the run to help with analytics tracking
   * Should stay constant from open to close of dialog.
   * Should be regenerated if the dialog is reopened.
   */
  run_id: string;
  abuse_vector: string;
  target_id: string;
  /** milliseconds since dialog opened */
  total_duration: number;
  /** array of nodeIds with current nodeId being the last */
  path: string[];
};

/** Convenience type for events with no additional properties. */
type EmptyEventProps = Record<string, never>;

/**
 * Type mapping from EventName to its corresponding event-specific props.
 */
export type EventNameToProps = {
  [EventName.OpenDialog]: EmptyEventProps;
  [EventName.NodeDone]: {
    /** nodeId of the node that was exited */
    node_id: string;
    /** type of the node like "list", "comment", etc */
    node_type: string;
    /** milliseconds spent in the node */
    node_duration: number;
    /** reason why the node was exited e.g */
    node_exit_reason: "next" | "back" | "close";
  };
  [EventName.EarlyClose]: EmptyEventProps;
  [EventName.Close]: EmptyEventProps;
  [EventName.Submit]: EmptyEventProps;
  [EventName.SubmitSuccess]: {
    /** milliseconds spent submitting e.g. submit API latency */
    submit_api_duration: number;
    report_id: string;
  };
  [EventName.SubmitFail]: {
    /** milliseconds spent submitting e.g. submit API latency */
    submit_api_duration: number;
  };
  [EventName.BackAction]: EmptyEventProps;
  [EventName.SelectItem]: {
    selected_index: number;
    list_length: number;
    has_scroll: boolean;
    did_scroll: boolean;
  };
  [EventName.IsUserBlockAvailable]: EmptyEventProps;
  [EventName.DidBlockUser]: EmptyEventProps;
  [EventName.DidUnblockUser]: EmptyEventProps;
  [EventName.HelplineShown]: EmptyEventProps;
  [EventName.HelplineOpened]: EmptyEventProps;
  [EventName.Error]: {
    error_message: string;
  };
};

export const sendAnalyticsEvent = <T extends EventName>(
  eventName: T,
  stateProps: CommonAnalyticsProps,
  eventProps: EventNameToProps[T],
): void => {
  const { abuse_vector, path, ...rest } = stateProps;
  const payload = {
    sub_event_type: eventName,
    path: path.join(","),
    client_version: CLIENT_VERSION,
    ...rest,
    ...eventProps,
  };

  if (!EventStream) {
    console.error("EventStream is not available");
    return;
  }
  EventStream.SendEventWithTarget(
    "DynamicAbuseReportEventV2",
    abuse_vector,
    payload,
    EventStream.TargetTypes.WWW,
  );
};

export type StatefulSendEvent = <T extends EventName>(
  eventName: T,
  eventProps: EventNameToProps[T],
) => void;

export const getApiErrorMessage = (
  apiId: string,
  error: unknown,
  defaultMessage: string,
): string => {
  const parts = [`API Error:${apiId}: ${getErrorMessage(error, defaultMessage)}`];

  const status = getHttpStatus(error);
  if (status) parts.push(`Status: ${status}`);

  const code = httpService.parseErrorCode(error);
  if (code != null) parts.push(`Code: ${code}`);

  const body = getResponseBody(error);
  if (body) parts.push(`Body: ${body}`);

  return parts.join(". ");
};

/**
 * Send an analytics event for API errors when fetching the config.
 */
export const sendConfigApiErrorEvent = (
  error: unknown,
  {
    abuse_vector,
    target_id,
  }: {
    abuse_vector: string;
    target_id: string;
  },
): void => {
  sendAnalyticsEvent(
    EventName.Error,
    {
      run_id: getNewRunId(),
      abuse_vector,
      target_id,
      total_duration: 0,
      path: [],
    },
    {
      error_message: getApiErrorMessage("config", error, "Failed to fetch config"),
    },
  );
};

/**
 * Send an analytics event for runtime errors (e.g., React error boundary).
 */
export const sendRuntimeErrorEvent = (
  error: unknown,
  componentStack: string,
  {
    abuse_vector,
    target_id,
  }: {
    abuse_vector: string;
    target_id: string;
  },
): void => {
  const fullErrorMessage = getErrorMessage(error, "Unknown error");
  const errorMessage =
    fullErrorMessage.length > 500 ? `${fullErrorMessage.slice(0, 500)}...` : fullErrorMessage;
  const trimmedStack =
    componentStack.length > 500 ? `${componentStack.slice(0, 500)}...` : componentStack;
  sendAnalyticsEvent(
    EventName.Error,
    {
      run_id: getNewRunId(),
      abuse_vector,
      target_id,
      total_duration: 0,
      path: [],
    },
    {
      error_message: `Error: ${errorMessage}\nStack: ${trimmedStack}`,
    },
  );
};
