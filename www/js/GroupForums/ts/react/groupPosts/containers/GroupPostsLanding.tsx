import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'react-router-dom';
import { CurrentUser, ExperimentationService } from 'Roblox';
import PostSkeleton from '../../groupForums/components/PostSkeleton';
import groupForumsConstants from '../../groupForums/constants/groupForumsConstants';
import useForumStore from '../../groupForums/hooks/useForumStore';
import announcementRoutes from '../../groupShouts/constants/announcementRoutes';
import useAnnouncementArchiveQuery, {
  ANNOUNCEMENTS_PER_PAGE
} from '../../groupShouts/hooks/useAnnouncementArchiveQuery';
import { layers } from '../../shared/constants/experimentConstants';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import { Group } from '../../shared/types';

export interface GroupPostsLandingProps {
  group: Group;
  canViewAnnouncements: boolean | undefined;
  canViewForums: boolean | undefined;
  canViewForumCategories: boolean | undefined;
}

interface ForumsLandingConfig {
  isEnabled: boolean;
  maxAnnouncementCount: number;
}

const isForumsLandingConfig = (value: unknown): value is ForumsLandingConfig => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const { isEnabled, maxAnnouncementCount } = value as Record<string, unknown>;
  return (
    typeof isEnabled === 'boolean' &&
    typeof maxAnnouncementCount === 'number' &&
    Number.isInteger(maxAnnouncementCount) &&
    maxAnnouncementCount >= 0 &&
    maxAnnouncementCount < ANNOUNCEMENTS_PER_PAGE
  );
};

const forumsRedirect = <Redirect to={groupForumsConstants.router.defaultRoute} />;
const announcementsRedirect = <Redirect to={announcementRoutes.announcementsRoute} />;

const AnnouncementCountLanding = ({ group }: { group: Group }): JSX.Element => {
  const categories = useForumStore.use.categories();
  const categoriesLoaded = useForumStore.use.categoriesLoaded();
  const { features } = useCommunityProductFeatures();
  const landingCategory = categoriesLoaded
    ? categories.find(category => !(features.ForumsRestrictedCategories && category.isRestricted))
    : undefined;
  const { data, error, isFetching } = useAnnouncementArchiveQuery(group.id);
  const { data: landingConfig } = useQuery({
    queryKey: [`ixp/${layers.announcementArchive}`],
    queryFn: () =>
      ExperimentationService.getAllValuesForLayer(layers.announcementArchive).catch(
        (): Record<string, unknown> => ({})
      ),
    select: response =>
      isForumsLandingConfig(response?.forumsLandingConfig) ? response.forumsLandingConfig : null,
    staleTime: Infinity,
    enabled: !!landingCategory
  });
  const config = landingCategory ? landingConfig : undefined;
  const firstPage = isFetching ? undefined : data?.pages[0];
  const isForumsLandingEligible =
    !!config && !!firstPage && firstPage.data.length <= config.maxAnnouncementCount;

  useEffect(() => {
    if (isForumsLandingEligible) {
      ExperimentationService.logLayerExposure(layers.announcementArchive);
    }
  }, [isForumsLandingEligible]);

  if (
    (categoriesLoaded && !landingCategory) ||
    config === null ||
    (!isFetching && !firstPage && error)
  ) {
    return announcementsRedirect;
  }
  if (!landingCategory || !firstPage || config === undefined) {
    return <PostSkeleton />;
  }

  return isForumsLandingEligible && config.isEnabled ? (
    <Redirect
      to={groupForumsConstants.router.getCategoryRoute(
        landingCategory.shortId,
        landingCategory.name
      )}
    />
  ) : (
    announcementsRedirect
  );
};

const GroupPostsLanding = ({
  group,
  canViewAnnouncements,
  canViewForums,
  canViewForumCategories
}: GroupPostsLandingProps): JSX.Element => {
  if (canViewAnnouncements === undefined || canViewForums === undefined) {
    return <PostSkeleton />;
  }
  if (!canViewAnnouncements) {
    return canViewForums ? forumsRedirect : announcementsRedirect;
  }
  if (!canViewForums || !CurrentUser.isAuthenticated || canViewForumCategories === false) {
    return announcementsRedirect;
  }
  if (canViewForumCategories === undefined) {
    return <PostSkeleton />;
  }

  return <AnnouncementCountLanding group={group} />;
};

export default GroupPostsLanding;
