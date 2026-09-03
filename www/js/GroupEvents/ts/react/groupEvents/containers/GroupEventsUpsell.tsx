import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Button } from '@rbx/foundation-ui';
import { Loading, Link } from 'react-style-guide';
import { groupsConfig } from '../translation.config';
import eventsService from '../services/eventsService';
import { GroupGame } from '../types';
import { Group } from '../../shared/types';
import { logGroupPageClickEvent } from '../../shared/utils/logging';
import { EventContext as SharedEventContext } from '../../shared/constants/eventConstants';
import groupEventsConstants from '../constants/groupEventsConstants';

export type GroupEventsUpsellProps = {
  group: Group;
} & WithTranslationsProps;

const GroupEventsUpsell = ({ group, translate }: GroupEventsUpsellProps): JSX.Element | null => {
  const [mostPopularGroupGame, setMostPopularGroupGame] = useState<GroupGame | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    if (!group?.id) {
      return;
    }

    try {
      const groupGames = await eventsService.getGamesForGroup(group.id);
      if (groupGames.length > 0) {
        let mostPopularGame = groupGames[0];
        for (let i = 1; i < groupGames.length; i++) {
          if (groupGames[i].placeVisits > mostPopularGame.placeVisits) {
            mostPopularGame = groupGames[i];
          }
        }
        setMostPopularGroupGame(mostPopularGame);
      }
    } catch (error) {
      // best effort to clean up and recover
      setMostPopularGroupGame(null);
    } finally {
      setIsLoading(false);
    }
  }, [group, setMostPopularGroupGame]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchData();
  }, [fetchData]);

  const url = useMemo(() => {
    if (mostPopularGroupGame == null) {
      // If the group doesn't have any experiences then link them to the creator dashboard for this group
      // where they can create an experience and then an event for that experience
      return groupEventsConstants.urls.getCreateExperienceUrl(group.id);
    }
    return groupEventsConstants.urls.getCreateEventForExperienceUrl(mostPopularGroupGame.id);
  }, [mostPopularGroupGame, group.id]);

  const onCreateEvent = useCallback(() => {
    logGroupPageClickEvent({
      groupId: group.id,
      clickTargetType: 'createEvent',
      context: SharedEventContext.GroupHomepage
    });
  }, [group.id]);

  if (isLoading) {
    return <Loading />;
  }
  return (
    <div className='section-content-off'>
      <span className='group-event-calendar-icon' />
      <h2>{translate('Label.GroupEventsUpsell')}</h2>
      <span>{translate('Label.GroupEventsCreatorHubUpsell')}</span>
      <Link url={url}>
        <Button
          type='button'
          variant='Emphasis'
          size='Medium'
          className='group-create-event-button'
          onClick={onCreateEvent}>
          {translate('Label.CreateEvent')}
        </Button>
      </Link>
    </div>
  );
};

export default withTranslations(GroupEventsUpsell, groupsConfig);
