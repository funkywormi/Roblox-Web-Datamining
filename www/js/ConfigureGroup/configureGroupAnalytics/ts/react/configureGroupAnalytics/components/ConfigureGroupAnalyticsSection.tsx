import React, { useMemo, useRef, useEffect } from 'react';
import { Dropdown, Menu, MenuItem, MenuSection } from '@rbx/foundation-ui';
import { useSystemFeedback } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import { Group } from '../../shared/types';
import {
  GROUP_ANALYTICS_CARDS,
  GROUP_ANALYTICS_DATE_RANGES,
  GROUP_ANALYTICS_CARDS_BY_ID,
  GroupAnalyticsCardId
} from '../groupAnalyticsDefinitions';
import { GroupAnalyticsProvider, useGroupAnalytics } from '../contexts/GroupAnalyticsContext';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import GroupAnalyticsCard from './GroupAnalyticsCard';
import Banner from '../../shared/components/Banner';
import { logGroupPageExposureEvent, logGroupPageClickEvent } from '../../shared/utils/logging';
import { EventContext, EventType } from '../../shared/constants/eventConstants';
import analyticsConstants from '../constants/analyticsConstants';

export type ConfigureGroupAnalyticsSectionProps = {
  group: Group;
};

const CARDS_ROW_0 = [
  GROUP_ANALYTICS_CARDS_BY_ID[GroupAnalyticsCardId.CommunityVisits],
  GROUP_ANALYTICS_CARDS_BY_ID[GroupAnalyticsCardId.Members]
];

const CARDS_FORUMS = [
  GROUP_ANALYTICS_CARDS_BY_ID[GroupAnalyticsCardId.ForumPostViews],
  GROUP_ANALYTICS_CARDS_BY_ID[GroupAnalyticsCardId.ForumCommentsCreated],
  GROUP_ANALYTICS_CARDS_BY_ID[GroupAnalyticsCardId.ForumPostsCreated]
];

const CARDS_ANNOUNCEMENTS = [
  GROUP_ANALYTICS_CARDS_BY_ID[GroupAnalyticsCardId.AnnouncementViews],
  GROUP_ANALYTICS_CARDS_BY_ID[GroupAnalyticsCardId.AnnouncementEngagement],
  GROUP_ANALYTICS_CARDS_BY_ID[GroupAnalyticsCardId.AnnouncementDeliveries]
];

const ConfigureGroupAnalyticsContent: React.FC<ConfigureGroupAnalyticsSectionProps> = ({
  group
}) => {
  const { SystemFeedbackComponent } = useSystemFeedback();
  const { translate } = useTranslation();
  const { timeRangeDays, setTimeRangeDays } = useGroupAnalytics();
  const { features } = useCommunityProductFeatures();

  const onValueChange = (value: string) => {
    setTimeRangeDays(Number(value));
  };

  const hasLoggedExposure = useRef(false);
  useEffect(() => {
    if (!hasLoggedExposure.current && group?.id) {
      hasLoggedExposure.current = true;
      logGroupPageExposureEvent({
        groupId: group.id,
        exposureType: EventType.CmntyAnalyticsExposureEvent,
        context: EventContext.ConfigureGroup
      });
    }
  }, [group?.id]);

  const onClickViewButton = () => {
    logGroupPageClickEvent({
      groupId: group.id,
      clickTargetType: EventType.CmntyAnalyticsClickEvent,
      context: EventContext.ConfigureGroup
    });
  };

  return (
    <React.Fragment>
      <SystemFeedbackComponent />
      <div key={group.id} className='group-analytics-section'>
        <Banner
          title={translate('Heading.GroupAnalyticsGoToCreatorHub')}
          content={translate('Description.GroupAnalyticsGoToCreatorHub')}
          iconName='icon-filled-chart-scatter-plot'
          buttonText={translate('Action.View')}
          buttonHref={analyticsConstants.urls.getCreatorHubGroupAnalyticsUrl(group.id)}
          buttonTarget='_blank'
          onClickButton={onClickViewButton}
          dismissable={false}
          flavor='flat'
        />
        <div className='group-analytics-section-header'>
          <h2>{translate('Heading.Analytics')}</h2>
          <Dropdown
            placeholder={String(timeRangeDays)}
            value={String(timeRangeDays)}
            size='Medium'
            className='group-analytics-section-time-range'
            isDisabled={false}
            onValueChange={onValueChange}>
            <Menu>
              <MenuSection>
                {GROUP_ANALYTICS_DATE_RANGES.map(dateRange => (
                  <MenuItem
                    key={dateRange.id}
                    value={dateRange.numOfDays.toString()}
                    title={translate(dateRange.titleKey)}
                  />
                ))}
              </MenuSection>
            </Menu>
          </Dropdown>
        </div>
        <div className='group-analytics-section-cards'>
          <div className='group-analytics-section-grid group-analytics-section-grid-row-0'>
            {CARDS_ROW_0.map(card => (
              <GroupAnalyticsCard key={card.id} metrics={[card]} />
            ))}
          </div>
          {features.AnnouncementAnalytics ? (
            <div className='group-analytics-section-grid group-analytics-section-grid-row-1--stacked'>
              <GroupAnalyticsCard title={translate('Heading.Forums')} metrics={CARDS_FORUMS} />
              <GroupAnalyticsCard
                title={translate('Heading.Announcements')}
                metrics={CARDS_ANNOUNCEMENTS}
              />
            </div>
          ) : (
            <div className='group-analytics-section-grid group-analytics-section-grid-row-1'>
              {CARDS_FORUMS.map(card => (
                <GroupAnalyticsCard key={card.id} metrics={[card]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

const ConfigureGroupAnalyticsSection: React.FC<ConfigureGroupAnalyticsSectionProps> = ({
  group
}) => {
  const { features } = useCommunityProductFeatures();

  const cards = useMemo(
    () =>
      features.AnnouncementAnalytics
        ? GROUP_ANALYTICS_CARDS
        : GROUP_ANALYTICS_CARDS.filter(c => !CARDS_ANNOUNCEMENTS.some(a => a.id === c.id)),
    [features.AnnouncementAnalytics]
  );

  return (
    <GroupAnalyticsProvider groupId={group.id} cards={cards}>
      <ConfigureGroupAnalyticsContent group={group} />
    </GroupAnalyticsProvider>
  );
};

export default ConfigureGroupAnalyticsSection;
