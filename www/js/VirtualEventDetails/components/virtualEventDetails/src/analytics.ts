import Roblox from "@rbx/core-scripts/legacy/Roblox";

const ctx = "virtualEvents";

const CHANNELS = {
  eventDetailsPage: "eventDetailsPage",
  link: "link",
};

const EVENT_NAMES = {
  virtualEventJoined: "virtualEventJoined",
  eventDetailsPageVisit: "eventDetailsPageVisit",
  virtualEventRSVP: "virtualEventRSVP",
  shareVirtualEventIconClicked: "shareVirtualEventIconClicked",
  virtualEventLinkCopied: "virtualEventLinkCopied",
};

export const getGameLaunchEventStreamProperties = (
  eventJoinSessionId: string,
): { eventName: string; ctx: string; eventJoinSessionId: string } => {
  return {
    eventName: "virtualEventJoinGame",
    ctx,
    eventJoinSessionId,
  };
};

const AnalyticsEvents = {
  sendEventDetailsPageVisitEvent: (eventId: string, universeId: number): void => {
    if (!Roblox.EventStream) return;
    Roblox.EventStream.SendEventWithTarget(
      EVENT_NAMES.eventDetailsPageVisit,
      ctx,
      {
        virtualEventId: eventId,
        universeId,
        channel: CHANNELS.link,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  },
  sendVirtualEventJoinedEvent: (
    eventId: string,
    universeId: number,
    sessionId: string,
    attendanceCount: number,
  ): void => {
    if (!Roblox.EventStream) return;
    Roblox.EventStream.SendEventWithTarget(
      EVENT_NAMES.virtualEventJoined,
      ctx,
      {
        virtualEventId: eventId,
        universeId,
        "SD.gamePlayFromEventDetails.ID": sessionId,
        "SD.gamePlayFromEventDetails.CT": Date.now(),
        channel: CHANNELS.eventDetailsPage,
        attendanceCount,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  },
  sendVirtualEventRSVPEvent: (
    eventId: string,
    universeId: number,
    status: string,
    attendanceCount: number,
  ): void => {
    if (!Roblox.EventStream) return;
    Roblox.EventStream.SendEventWithTarget(
      EVENT_NAMES.virtualEventRSVP,
      ctx,
      {
        virtualEventId: eventId,
        universeId,
        channel: CHANNELS.eventDetailsPage,
        status,
        attendanceCount,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  },
  sendShareVirtualEventIconClickedEvent: (
    eventId: string,
    universeId: number,
    attendanceCount: number,
  ): void => {
    if (!Roblox.EventStream) return;
    Roblox.EventStream.SendEventWithTarget(
      EVENT_NAMES.shareVirtualEventIconClicked,
      ctx,
      {
        virtualEventId: eventId,
        universeId,
        channel: CHANNELS.eventDetailsPage,
        attendanceCount,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  },
  sendVirtualEventLinkCopiedEvent: (
    eventId: string,
    universeId: number,
    virtualEventLink: string,
    attendanceCount: number,
  ): void => {
    if (!Roblox.EventStream) return;
    Roblox.EventStream.SendEventWithTarget(
      EVENT_NAMES.virtualEventLinkCopied,
      ctx,
      {
        virtualEventId: eventId,
        virtualEventLink,
        universeId,
        attendanceCount,
        channel: CHANNELS.eventDetailsPage,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  },
};

export default AnalyticsEvents;
