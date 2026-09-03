import { PlayButton, DeviceMeta } from 'Roblox';
import React, { useCallback, useState, useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { uuidService } from 'core-utilities';
import { Button } from '@rbx/foundation-ui';
import { TSystemFeedbackService } from 'react-style-guide';
import { groupEventsConfig } from '../translation.config';
import eventsService from '../services/eventsService';
import { VirtualEvent, GameDetails } from '../types';
import groupEventsConstants from '../constants/groupEventsConstants';
import AnalyticsEvents from '../utils/analytics';

const { launchGame } = PlayButton;
const { eventRsvpStatus } = groupEventsConstants;

export type GroupEventButtonProps = {
  event: VirtualEvent;
  gameDetails: GameDetails | undefined;
  systemFeedbackService: TSystemFeedbackService;
} & WithTranslationsProps;

const GroupEventButton = ({
  event,
  gameDetails,
  systemFeedbackService,
  translate
}: GroupEventButtonProps): JSX.Element | null => {
  const [userHasRsvpd, setUserHasRsvpd] = useState(event.userRsvpStatus === eventRsvpStatus.going);

  const setRsvpToGoing = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await eventsService.postRsvpStatus(event.id, eventRsvpStatus.going);
        setUserHasRsvpd(true);
        AnalyticsEvents.sendVirtualEventRSVPEvent(
          event.id,
          event.universeId,
          eventRsvpStatus.going
        );
      } catch {
        systemFeedbackService.warning(translate('NetworkError'));
      }
    },
    [event.id, event.universeId, setUserHasRsvpd, systemFeedbackService, translate]
  );

  const setRsvpToNotGoing = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await eventsService.postRsvpStatus(event.id, eventRsvpStatus.notGoing);
        setUserHasRsvpd(false);
        AnalyticsEvents.sendVirtualEventRSVPEvent(
          event.id,
          event.universeId,
          eventRsvpStatus.notGoing
        );
      } catch {
        systemFeedbackService.warning(translate('NetworkError'));
      }
    },
    [event.id, event.universeId, setUserHasRsvpd, systemFeedbackService, translate]
  );

  const joinEvent = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!gameDetails) return;
      const sessionId = uuidService.generateRandomUuid();
      const placeId = event.placeId || gameDetails.rootPlaceId.toString();
      if (DeviceMeta && DeviceMeta().isInApp) {
        window.location.href = `roblox://experiences/start?placeId=${placeId}`;
      } else {
        launchGame(
          placeId,
          gameDetails.rootPlaceId.toString(),
          '', // privateServerLinkCode
          undefined, // GameInstanceId
          {
            eventName: 'virtualEventJoinGame',
            ctx: 'virtualEvents',
            eventJoinSessionId: sessionId
          },
          {} // joinDataProperties
        );
      }
      AnalyticsEvents.sendVirtualEventJoinedEvent(event.id, event.universeId, sessionId);
    },
    [gameDetails, event.id, event.universeId]
  );

  const isEventLive = useMemo(() => Date.now() > Date.parse(event.eventTime.startUtc), [event]);

  if (isEventLive) {
    return (
      <Button
        type='button'
        variant='Emphasis'
        size='Medium'
        className='group-event-join-button'
        onClick={joinEvent}>
        {translate('JoinEvent')}
      </Button>
    );
  }
  if (userHasRsvpd) {
    return (
      <Button
        type='button'
        variant='Standard'
        size='Medium'
        className='group-event-join-button'
        onClick={setRsvpToNotGoing}>
        {translate('UnfollowEvent')}
      </Button>
    );
  }
  return (
    <Button
      type='button'
      variant='Emphasis'
      size='Medium'
      className='group-event-join-button'
      onClick={setRsvpToGoing}>
      {translate('NotifyMe')}
    </Button>
  );
};

export default withTranslations(GroupEventButton, groupEventsConfig);
