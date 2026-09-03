import Roblox from 'Roblox';

const ctx = 'virtualEvents';

const CHANNELS = {
  groupDetailsPage: 'groupDetailsPage'
};

const EVENT_NAMES = {
  virtualEventJoined: 'virtualEventJoined',
  eventDetailsPageVisit: 'eventDetailsPageVisit',
  virtualEventRSVP: 'virtualEventRSVP'
};

const AnalyticsEvents = {
  sendVirtualEventJoinedEvent: (eventId: string, universeId: number, sessionId: string): void => {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_NAMES.virtualEventJoined,
      ctx,
      {
        virtualEventId: eventId,
        universeId,
        'SD.gamePlayFromEventDetails.ID': sessionId,
        'SD.gamePlayFromEventDetails.CT': Date.now(),
        channel: CHANNELS.groupDetailsPage
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  },
  sendEventDetailsPageVisitEvent: (eventId: string, universeId: number): void => {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_NAMES.eventDetailsPageVisit,
      ctx,
      {
        virtualEventId: eventId,
        universeId,
        channel: CHANNELS.groupDetailsPage
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  },
  sendVirtualEventRSVPEvent: (eventId: string, universeId: number, status: string): void => {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_NAMES.virtualEventRSVP,
      ctx,
      {
        virtualEventId: eventId,
        universeId,
        channel: CHANNELS.groupDetailsPage,
        status
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }
};

export default AnalyticsEvents;
