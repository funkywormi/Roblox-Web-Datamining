import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Loading } from 'react-style-guide';
import classNames from 'classnames';
import { groupsConfig } from '../translation.config';
import eventsService from '../services/eventsService';
import { VirtualEvent, GameDetails } from '../types';
import GroupEvent from './GroupEvent';
import GroupEventsUpsell from './GroupEventsUpsell';
import { Group } from '../../shared/types';
import groupEventsConstants from '../constants/groupEventsConstants';

const { eventStatus } = groupEventsConstants;

export type GroupEventsSectionProps = {
  onlyShowFeaturedEvent: boolean;
  group: Group;
  canSetFeaturedEvent: boolean;
} & WithTranslationsProps;

const GroupEventsSection = ({
  onlyShowFeaturedEvent,
  group,
  canSetFeaturedEvent,
  translate
}: GroupEventsSectionProps): JSX.Element | null => {
  const [events, setEvents] = useState<VirtualEvent[]>([]);
  const [gameDetails, setGameDetails] = useState<GameDetails[]>([]);
  const [featuredEventId, setFeaturedEventId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    if (!group?.id) {
      return;
    }

    try {
      const featuredEvent = await eventsService.getFeaturedEvent(group.id);
      setFeaturedEventId(featuredEvent?.contentId);

      let fetchedEvents;
      if (onlyShowFeaturedEvent) {
        const featuredEventDetails = await eventsService.getVirtualEventDetails(
          featuredEvent.contentId
        );
        fetchedEvents = [featuredEventDetails];
      } else {
        const upcomingEvents = await eventsService.getVirtualEvents(group.id);
        const upcomingEventsDetails = await Promise.all(
          upcomingEvents.map(async event => eventsService.getVirtualEventDetails(event.id))
        );
        fetchedEvents = upcomingEventsDetails;
      }
      // Ensure we don't show any events that have been cancelled or have ended
      const filteredEvents = fetchedEvents
        .filter(
          event =>
            event.eventStatus === eventStatus.active &&
            Date.now() < Date.parse(event.eventTime.endUtc)
        )
        .sort(
          (event1: VirtualEvent, event2: VirtualEvent) =>
            Date.parse(event1.eventTime.startUtc) - Date.parse(event2.eventTime.startUtc)
        );
      setEvents(filteredEvents);

      const universeIds = fetchedEvents.map(event => event.universeId);
      const fetchedGameDetails = await eventsService.getGameDetailsForUniverseIds(universeIds);
      setGameDetails(fetchedGameDetails);
    } catch (error) {
      // best effort to clean up and recover
      setFeaturedEventId(undefined);
      setEvents([]);
      setGameDetails([]);
    } finally {
      setIsLoading(false);
    }
  }, [group, onlyShowFeaturedEvent]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchData();
  }, [fetchData]);

  const content = useMemo(() => {
    const getGameDetailsForUniverse = (universeId: number) => {
      return gameDetails.find(gameDetail => gameDetail.id === universeId);
    };

    if (isLoading) {
      return <Loading />;
    }
    if (events && events.length > 0) {
      return (
        <div
          className={classNames(
            'group-events group-section-content-transparent',
            onlyShowFeaturedEvent && 'group-events-full-size'
          )}>
          {events.map(event => (
            <GroupEvent
              key={event.id}
              group={group}
              event={event}
              gameDetails={getGameDetailsForUniverse(event.universeId)}
              featuredEventId={featuredEventId}
              setFeaturedEventId={setFeaturedEventId}
              canSetFeaturedEvent={canSetFeaturedEvent}
              isFullSized={onlyShowFeaturedEvent}
            />
          ))}
        </div>
      );
    }
    if (onlyShowFeaturedEvent) {
      // No upsell when only showing the featured event
      return null;
    }
    if (canSetFeaturedEvent) {
      return <GroupEventsUpsell group={group} />;
    }
    return (
      <div className='section-content-off'>
        <span className='group-event-calendar-icon' />
        <h2>{translate('Label.NoGroupEvents')}</h2>
        <span>{translate('Label.CheckLaterForEvents')}</span>
      </div>
    );
  }, [
    group,
    isLoading,
    events,
    featuredEventId,
    setFeaturedEventId,
    translate,
    gameDetails,
    onlyShowFeaturedEvent,
    canSetFeaturedEvent
  ]);

  if (onlyShowFeaturedEvent && (!events?.length || !featuredEventId)) {
    return null;
  }

  return (
    <div className='section'>
      <div className='container-header group-events-header'>
        <h2>{translate('Heading.Events')}</h2>
      </div>
      {content}
    </div>
  );
};

export default withTranslations(GroupEventsSection, groupsConfig);
