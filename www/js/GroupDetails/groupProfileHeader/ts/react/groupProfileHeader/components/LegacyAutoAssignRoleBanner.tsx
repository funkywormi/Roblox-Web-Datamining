import React, { FC, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CurrentUser } from 'Roblox';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../translation.config';
import ActionableBanner from '../../shared/components/ActionableBanner';
import MetricsElement from '../../shared/components/MetricsElement';
import groupSettingsService from '../../configureGroupSettings/services/groupSettingsService';
import useGroupOwner from '../../shared/hooks/useGroupOwner';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import { EventContext } from '../../shared/constants/eventConstants';
import CommunityEventStream, {
  CommunityMetric,
  getImpressionId
} from '../../shared/utils/eventStream';
import { getCommonParams } from '../../shared/utils/pageInfo';

// Scoped per community: an owner of several legacy communities must acknowledge each one, rather
// than having a single dismissal hide the notice everywhere.
const getDismissedStorageKey = (groupId: number): string =>
  `Roblox.GroupDetails.LegacyAutoAssignRoleBanner.${groupId}`;
const LEGACY_AUTO_ASSIGN_ROLE_BANNER_EXPOSURE_TYPE = 'legacyAutoAssignRoleBanner';
const LEGACY_AUTO_ASSIGN_ROLE_BANNER_DISMISS_TARGET = 'legacyAutoAssignRoleDismiss';
const TRANSLATION_KEYS = {
  title: 'Heading.LegacyAutoAssignRoleBanner',
  content: 'Description.LegacyAutoAssignRoleBanner'
};

export type LegacyAutoAssignRoleBannerProps = {
  groupId: number;
  isCommunityPage: boolean;
};

type Props = LegacyAutoAssignRoleBannerProps & WithTranslationsProps;

export const LegacyAutoAssignRoleBanner: FC<Props> = ({
  groupId,
  isCommunityPage,
  translate,
  intl
}) => {
  const currentUserId = CurrentUser.isAuthenticated ? Number(CurrentUser.userId) : 0;
  const ownerUserId = useGroupOwner(groupId);
  const isOwner = currentUserId > 0 && currentUserId === ownerUserId;
  // Owner/manager only -- the endpoint 403s for everyone else, so wait until ownership is known.
  const { data: groupSettings } = useQuery({
    queryKey: ['groupSettings', groupId],
    queryFn: () => groupSettingsService.getGroupSettings(groupId),
    enabled: isOwner,
    staleTime: Infinity,
    retry: false
  });
  const { data: guacConfig, isLoading } = useGuacConfig('group-details-ui');
  const { displayLegacyAutoAssignRoleBanner, legacyAutoAssignRoleCutoffDate } = guacConfig;

  // The cutoff is a date-only ISO string, which parses to UTC midnight; format it in UTC so the
  // displayed day does not shift for viewers behind UTC. A cutoff that has already passed yields
  // null so the banner retires on schedule rather than leaving future-tense copy up until someone
  // turns the GUAC gate off by hand.
  const formattedCutoffDate = useMemo(() => {
    const cutoffDate = new Date(legacyAutoAssignRoleCutoffDate ?? '');
    if (Number.isNaN(cutoffDate.getTime()) || cutoffDate.getTime() <= Date.now()) {
      return null;
    }

    return new Intl.DateTimeFormat(intl.locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(cutoffDate);
  }, [legacyAutoAssignRoleCutoffDate, intl]);

  const componentMetric = useMemo(() => {
    const { pageRoute, locationTab } = getCommonParams(
      window.location.hash,
      window.location.pathname
    );

    return {
      groupId,
      context: EventContext.GroupHomepage,
      pageRoute,
      locationTab,
      sessionId: getImpressionId()
    };
  }, [groupId]);

  const shouldShowBanner =
    !isLoading &&
    groupId > 0 &&
    isCommunityPage &&
    isOwner &&
    !!groupSettings?.hasLegacyAutoAssignRole &&
    !!displayLegacyAutoAssignRoleBanner &&
    formattedCutoffDate !== null;

  const handleDismiss = useCallback(() => {
    CommunityEventStream.sendEvent(
      CommunityMetric.GroupPageClick({
        ...componentMetric,
        clickTargetType: LEGACY_AUTO_ASSIGN_ROLE_BANNER_DISMISS_TARGET
      })
    );
  }, [componentMetric]);

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <ActionableBanner
      testId='legacy-auto-assign-role-banner'
      title={translate(TRANSLATION_KEYS.title, { cutOffDate: formattedCutoffDate })}
      content={translate(TRANSLATION_KEYS.content)}
      isDismissedLocalStorageKey={getDismissedStorageKey(groupId)}
      onDismiss={handleDismiss}>
      <MetricsElement
        isOneTimeEvent
        metric={CommunityMetric.GroupPageExposure({
          ...componentMetric,
          exposureType: LEGACY_AUTO_ASSIGN_ROLE_BANNER_EXPOSURE_TYPE
        })}
      />
    </ActionableBanner>
  );
};

const TranslatedLegacyAutoAssignRoleBanner = withTranslations(
  LegacyAutoAssignRoleBanner,
  groupsConfig
);

export const LegacyAutoAssignRoleBannerWithProvider: FC<LegacyAutoAssignRoleBannerProps> = ({
  groupId,
  isCommunityPage
}) => <TranslatedLegacyAutoAssignRoleBanner groupId={groupId} isCommunityPage={isCommunityPage} />;

export default TranslatedLegacyAutoAssignRoleBanner;
