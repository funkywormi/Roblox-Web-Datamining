import { Intl } from 'Roblox';
import React, { Dispatch, useMemo, useCallback, useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import {
  IconButton,
  Menu,
  MenuItem,
  MenuSection,
  Popover,
  PopoverContent
} from '@rbx/foundation-ui';
import { Link, createSystemFeedback } from 'react-style-guide';
import '../../../../css/tailwind.css';
import { Thumbnail2d, ThumbnailTypes, ThumbnailUniverseThumbnailSize } from 'roblox-thumbnails';
import { groupsConfig } from '../translation.config';
import eventsService from '../services/eventsService';
import { VirtualEvent, GameDetails } from '../types';
import { Group } from '../../shared/types';
import MenuTrigger from '../../shared/components/MenuTrigger';
import GroupEventButton from './GroupEventButton';
import { logGroupPageClickEvent } from '../../shared/utils/logging';
import { EventContext } from '../../shared/constants/eventConstants';
import groupEventsConstants from '../constants/groupEventsConstants';
import AnalyticsEvents from '../utils/analytics';

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
const { locale } = new Intl();

const GROUP_EVENT_MENU_CLASS = 'group-event-dropdown-menu';

export type GroupEventProps = {
  group: Group;
  event: VirtualEvent;
  gameDetails: GameDetails | undefined;
  featuredEventId: string | undefined;
  setFeaturedEventId: Dispatch<string | undefined>;
  canSetFeaturedEvent: boolean;
  isFullSized: boolean;
} & WithTranslationsProps;

const GroupEvent = ({
  group,
  event,
  gameDetails,
  featuredEventId,
  setFeaturedEventId,
  canSetFeaturedEvent,
  isFullSized,
  translate
}: GroupEventProps): JSX.Element | null => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isFeaturedEvent = useMemo(() => {
    return featuredEventId === event.id;
  }, [featuredEventId, event.id]);

  const featureEvent = useCallback(async () => {
    try {
      if (isFeaturedEvent) {
        // Unfeature the event if it is already featured
        await eventsService.deleteFeaturedEvent(group.id, event.id);
        setFeaturedEventId(undefined);
        systemFeedbackService.success(translate('Message.UnfeatureEventSuccess'));
      } else {
        await eventsService.postFeaturedEvent(group.id, event.id);
        setFeaturedEventId(event.id);
        systemFeedbackService.success(translate('Message.FeatureEventSuccess'));
      }
      logGroupPageClickEvent({
        groupId: group.id,
        clickTargetType: isFeaturedEvent ? 'unfeatureEvent' : 'featureEvent',
        clickTargetId: event.id.toString(),
        context: EventContext.GroupHomepage
      });
    } catch {
      systemFeedbackService.warning(translate('NetworkError'));
    }
  }, [isFeaturedEvent, setFeaturedEventId, group.id, event.id, translate]);

  const dateDescription = useMemo(() => {
    const date = new Date(Date.parse(event.eventTime.startUtc));
    const dayString = date.toLocaleString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeString = date.toLocaleString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    return translate('Label.EventDate', {
      dayString,
      timeString
    });
  }, [event, translate]);

  const thumbnailTargetId = useMemo(() => {
    // If a thumbnail was uploaded with the event then use that, otherwise just use the thumbnail for the events game
    return event.thumbnails?.[0]?.mediaId || event.universeId;
  }, [event]);

  const thumbnailType = useMemo(() => {
    return event.thumbnails?.[0]?.mediaId
      ? ThumbnailTypes.assetThumbnail
      : ThumbnailTypes.universeThumbnail;
  }, [event]);

  const iconButtonOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // This is needed so opening the dropdown menu doesn't fire the event that links to the events page
    e.preventDefault();
    e.stopPropagation();
  };

  const toggleMenu = useCallback(() => setIsMenuOpen(open => !open), []);

  const handleFeatureEvent = useCallback(() => {
    setIsMenuOpen(false);
    // eslint-disable-next-line no-void
    void featureEvent();
  }, [featureEvent]);

  const trackEventDetailsPageVisit = useCallback(
    (clickEvent: React.MouseEvent) => {
      // Portaled menu clicks still bubble here through the React tree, and never navigate.
      if (
        clickEvent.target instanceof Element &&
        clickEvent.target.closest(`.${GROUP_EVENT_MENU_CLASS}`)
      ) {
        return;
      }
      AnalyticsEvents.sendEventDetailsPageVisitEvent(event.id, event.universeId);
    },
    [event.id, event.universeId]
  );

  return (
    <Link
      aria-label={event.title}
      onClick={trackEventDetailsPageVisit}
      url={groupEventsConstants.urls.getEventUrl(event.id)}>
      <div className='group-event'>
        <div className='group-event-thumbnail'>
          <Thumbnail2d
            type={thumbnailType}
            size={ThumbnailUniverseThumbnailSize.width768}
            targetId={thumbnailTargetId}
            containerClass='group-event-thumbnail-container'
          />
        </div>
        <div className='group-event-content'>
          <div className='group-event-header'>
            <h2>{event.title}</h2>
          </div>
          <div className='group-event-date text-default font-bold'>{dateDescription}</div>
          {isFullSized && (
            <div className='group-event-description text-description'>{event.description}</div>
          )}
          <div className='group-event-follow-button'>
            <GroupEventButton
              event={event}
              gameDetails={gameDetails}
              systemFeedbackService={systemFeedbackService}
            />
            {canSetFeaturedEvent && (
              <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <MenuTrigger
                  button={
                    <IconButton
                      className='group-event-feature-button'
                      icon='icon-filled-three-dots-horizontal'
                      variant='Utility'
                      size='Small'
                      ariaLabel={translate('Action.More')}
                      onClick={iconButtonOnClick}
                    />
                  }
                  onToggle={toggleMenu}
                />
                <PopoverContent
                  ariaLabel={translate('Label.OverflowMenu')}
                  side='bottom'
                  align='end'>
                  <Menu className={GROUP_EVENT_MENU_CLASS} size='Medium'>
                    <MenuSection>
                      <MenuItem
                        value='feature-event'
                        title={
                          isFeaturedEvent
                            ? translate('Action.UnfeatureEvent')
                            : translate('Action.FeatureEvent')
                        }
                        onSelect={handleFeatureEvent}
                      />
                    </MenuSection>
                  </Menu>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
      <SystemFeedback />
    </Link>
  );
};

export default withTranslations(GroupEvent, groupsConfig);
