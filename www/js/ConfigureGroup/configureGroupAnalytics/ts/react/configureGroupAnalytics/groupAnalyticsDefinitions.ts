export enum ChartSummaryType {
  Total = 'Total',
  LastValue = 'LastValue'
}

export enum GroupAnalyticsCardId {
  CommunityVisits,
  Members,
  ForumPostViews,
  ForumCommentsCreated,
  ForumPostsCreated,
  AnnouncementViews,
  AnnouncementEngagement,
  AnnouncementDeliveries
}

export type GroupAnalyticsCardDefinition = {
  id: GroupAnalyticsCardId;
  titleKey: string;
  metricName: string;
  dimension?: string;
  values?: string[];
  chartSummaryType?: ChartSummaryType;
};

export const GROUP_ANALYTICS_CARDS_BY_ID: Record<
  GroupAnalyticsCardId,
  GroupAnalyticsCardDefinition
> = {
  [GroupAnalyticsCardId.CommunityVisits]: {
    id: GroupAnalyticsCardId.CommunityVisits,
    titleKey: 'Heading.CommunityVisits',
    metricName: 'CommunityGroupPageViews',
    dimension: 'PageViewContext',
    values: ['PageViewWeb', 'PageViewApp']
  },
  [GroupAnalyticsCardId.Members]: {
    id: GroupAnalyticsCardId.Members,
    titleKey: 'Heading.Members',
    metricName: 'CommunityMembershipCount',
    chartSummaryType: ChartSummaryType.LastValue
  },
  [GroupAnalyticsCardId.ForumPostViews]: {
    id: GroupAnalyticsCardId.ForumPostViews,
    titleKey: 'Heading.ForumPostViews',
    metricName: 'CommunityGroupPageViews',
    dimension: 'PageViewContext',
    values: ['PostView']
  },
  [GroupAnalyticsCardId.ForumCommentsCreated]: {
    id: GroupAnalyticsCardId.ForumCommentsCreated,
    titleKey: 'Heading.ForumComments',
    metricName: 'CommunityForumContentEventCount',
    dimension: 'ForumContentEventType',
    values: ['CommentCreate']
  },
  [GroupAnalyticsCardId.ForumPostsCreated]: {
    id: GroupAnalyticsCardId.ForumPostsCreated,
    titleKey: 'Heading.ForumPostsCreated',
    metricName: 'CommunityForumContentEventCount',
    dimension: 'ForumContentEventType',
    values: ['PostCreate']
  },
  [GroupAnalyticsCardId.AnnouncementViews]: {
    id: GroupAnalyticsCardId.AnnouncementViews,
    titleKey: 'Heading.AnnouncementViews',
    metricName: 'CommunityAnnouncementEventCount',
    dimension: 'AnnouncementEventType',
    values: ['View']
  },
  [GroupAnalyticsCardId.AnnouncementEngagement]: {
    id: GroupAnalyticsCardId.AnnouncementEngagement,
    titleKey: 'Heading.AnnouncementEngagement',
    // Nets reaction removals across the whole window; filtering EventCount on
    // AnnouncementEventType cannot, because a value list is summed, never subtracted
    metricName: 'CommunityAnnouncementEngagement'
  },
  [GroupAnalyticsCardId.AnnouncementDeliveries]: {
    id: GroupAnalyticsCardId.AnnouncementDeliveries,
    titleKey: 'Heading.AnnouncementDeliveries',
    metricName: 'CommunityAnnouncementEventCount',
    dimension: 'AnnouncementEventType',
    values: ['PushDelivered', 'StreamDelivered']
  }
};

export const GROUP_ANALYTICS_CARDS = Object.values(GROUP_ANALYTICS_CARDS_BY_ID);

export type GroupAnalyticsDateRangeDefinition = {
  id: string;
  titleKey: string;
  numOfDays: number;
};

// Starting date when all metrics will have values backfilled to
export const GROUP_ANALYTICS_METRIC_START_DATE = new Date('2026-04-01T00:00:00.000Z');

function isRangeAvailable(range: GroupAnalyticsDateRangeDefinition) {
  // Only show date ranges where the metrics are all available
  const startTime = new Date();
  const endTime = new Date();
  endTime.setDate(startTime.getDate() - range.numOfDays);
  return endTime >= GROUP_ANALYTICS_METRIC_START_DATE;
}

export const GROUP_ANALYTICS_DATE_RANGES: GroupAnalyticsDateRangeDefinition[] = [
  {
    id: 'last7Days',
    titleKey: 'Action.Last7Days',
    numOfDays: 7
  },
  {
    id: 'last28Days',
    titleKey: 'Action.Last28Days',
    numOfDays: 28
  },
  {
    id: 'last90Days',
    titleKey: 'Action.Last90Days',
    numOfDays: 90
  },
  {
    id: 'last365Days',
    titleKey: 'Action.Last365Days',
    numOfDays: 365
  }
].filter(isRangeAvailable);
