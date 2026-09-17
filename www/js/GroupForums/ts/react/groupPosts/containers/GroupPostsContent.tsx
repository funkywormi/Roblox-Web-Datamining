import React from 'react';
import { useSystemFeedback } from 'react-style-guide';
import { Route, Switch } from 'react-router-dom';
import GroupForums from '../../groupForums/containers/GroupForums';
import useHydrateForumStore from '../../groupForums/hooks/useHydrateForumStore';
import AnnouncementRoutes from '../../groupShouts/containers/AnnouncementRoutes';
import announcementRoutes from '../../groupShouts/constants/announcementRoutes';
import { canViewAnnouncementArchive } from '../../groupShouts/constants/groupAnnouncementsConstants';
import { useCommunityFeatureFreezes } from '../../shared/contexts/CommunityFeatureFreezesContext';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import AnnouncementNavigation from '../components/AnnouncementNavigation';
import ForumNavigation from '../components/ForumNavigation';
import type { GroupPostsProps } from './GroupPosts';

type GroupPostsContentProps = GroupPostsProps & {
  isOwner: boolean;
};

const GroupPostsContent = ({
  group,
  permissions,
  channelsPermissions,
  userId,
  isGroupMember,
  forumsEnabled,
  policies,
  isOwner
}: GroupPostsContentProps): JSX.Element => {
  const { SystemFeedbackComponent } = useSystemFeedback();
  const { features, isLoading: areProductFeaturesLoading } = useCommunityProductFeatures();
  const { isLoading: areFeatureFreezesLoading, forumsRead } = useCommunityFeatureFreezes();
  const canViewAnnouncements = areProductFeaturesLoading
    ? undefined
    : canViewAnnouncementArchive(features, policies, permissions);
  const canViewForums =
    !policies.isGracefulDegradationEnabled && forumsEnabled && policies.displayGroupForums;
  const showForumCategories =
    canViewForums && !areFeatureFreezesLoading && (!forumsRead.isDisabled || isOwner);
  useHydrateForumStore(group.id, userId, showForumCategories);

  return (
    <div className='section'>
      <Switch>
        <Route path={announcementRoutes.announcementsRoute}>
          <AnnouncementRoutes
            group={group}
            permissions={permissions}
            isGroupMember={isGroupMember}
            policies={policies}
            canViewAnnouncements={canViewAnnouncements}
            navigation={<AnnouncementNavigation showForumCategories={showForumCategories} />}
          />
        </Route>
        <Route>
          <GroupForums
            group={group}
            permissions={permissions}
            channelsPermissions={channelsPermissions}
            userId={userId}
            isGroupMember={isGroupMember}
            canViewForums={canViewForums}
            isOwner={isOwner}
            categoriesNavigation={canViewAnnouncements ? ForumNavigation : undefined}
          />
        </Route>
      </Switch>
      <SystemFeedbackComponent />
    </div>
  );
};

export default GroupPostsContent;
