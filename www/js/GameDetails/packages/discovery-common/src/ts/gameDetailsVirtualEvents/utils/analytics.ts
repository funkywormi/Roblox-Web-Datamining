import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { TDiscoverySessionInfo } from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";

const ctx = "virtualEvents";

const CHANNELS = {
  experienceDetailsPage: "expDetailsPage",
};

const EVENT_NAMES = {
  virtualEventJoined: "virtualEventJoined",
  eventDetailsPageVisit: "eventDetailsPageVisit",
  virtualEventRSVP: "virtualEventRSVP",
  virtualEventImpression: "virtualEventImpression",
};

type TEventJoinPlayGameClickedProperties = {
  eventName: string;
  ctx: string;
  eventJoinSessionId: string;
  universeId: number;
  attributionId: string;
  page: PageContext | undefined;
} & TDiscoverySessionInfo;

export const getGameLaunchEventStreamProperties = (
  eventJoinSessionId: string,
  universeId: number,
  attributionId: string,
  referralSessionInfo: TDiscoverySessionInfo,
  referralPage: PageContext | undefined,
): TEventJoinPlayGameClickedProperties => {
  return {
    eventName: "virtualEventJoinGame",
    ctx,
    eventJoinSessionId,
    universeId,
    page: referralPage,
    attributionId,
    ...referralSessionInfo,
  };
};

const AnalyticsEvents = {
  sendVirtualEventImpressionFromExperienceDetailsPageEvent: (
    eventId: string,
    universeId: number,
  ): void => {
    sendEventWithTarget(
      EVENT_NAMES.virtualEventImpression,
      ctx,
      {
        virtualEventId: eventId,
        universeId,
        channel: CHANNELS.experienceDetailsPage,
      },
      targetTypes.WWW,
    );
  },
  sendVirtualEventJoinedFromExperienceDetailsPageEvent: (
    eventId: string,
    universeId: number,
    sessionId: string,
    attendanceCount: number,
  ): void => {
    sendEventWithTarget(
      EVENT_NAMES.virtualEventJoined,
      ctx,
      {
        virtualEventId: eventId,
        universeId,
        "SD.gamePlayFromEventDetails.ID": sessionId,
        "SD.gamePlayFromEventDetails.CT": Date.now(),
        channel: CHANNELS.experienceDetailsPage,
        attendanceCount,
      },
      targetTypes.WWW,
    );
  },
  sendEventDetailsPageVisitFromExpDetailsEvent: (eventId: string, universeId: number): void => {
    sendEventWithTarget(
      EVENT_NAMES.eventDetailsPageVisit,
      ctx,
      {
        virtualEventId: eventId,
        universeId,
        channel: CHANNELS.experienceDetailsPage,
      },
      targetTypes.WWW,
    );
  },
  sendVirtualEventRSVPFromExpDetailsEvent: (
    eventId: string,
    universeId: number,
    referralSessionInfo: TDiscoverySessionInfo,
    referralPage: PageContext | undefined,
    status: string,
    attendanceCount: number,
  ): void => {
    sendEventWithTarget(
      EVENT_NAMES.virtualEventRSVP,
      ctx,
      {
        virtualEventId: eventId,
        universeId,
        channel: CHANNELS.experienceDetailsPage,
        status,
        attendanceCount,
        page: referralPage,
        ...referralSessionInfo,
      },
      targetTypes.WWW,
    );
  },
};

export default AnalyticsEvents;
