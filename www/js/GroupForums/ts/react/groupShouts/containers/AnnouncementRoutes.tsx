import React, { ReactNode } from 'react';
import { CurrentUser } from 'Roblox';
import { useQuery } from '@tanstack/react-query';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';
import { useTranslation } from 'react-utilities';
import { Group, GroupPermissions } from '../../shared/types';
import { AnnouncementModel, GroupDetailsPolicies } from '../types';
import announcementRoutes from '../constants/announcementRoutes';
import AnnouncementArchive from './AnnouncementArchive';
import AnnouncementDetail from './AnnouncementDetail';
import AnnouncementComposer from '../components/AnnouncementComposer';
import SectionDisclaimer from '../../shared/components/SectionDisclaimer';
import announcementsService from '../services/announcementsService';
import PostSkeleton from '../../groupForums/components/PostSkeleton';
import queryKeys from '../utils/queryKeys';

type AnnouncementRoutesProps = {
  group: Group;
  permissions: GroupPermissions;
  isGroupMember: boolean;
  policies: GroupDetailsPolicies;
  canViewAnnouncements: boolean | undefined;
  navigation: ReactNode;
};

type AnnouncementEditRouteProps = {
  groupId: number;
};

const AnnouncementEditRoute = ({ groupId }: AnnouncementEditRouteProps): JSX.Element => {
  const { announcementId } = useParams<{ announcementId: string }>();
  const { translate } = useTranslation();
  const { data: announcement, error, isLoading, refetch } = useQuery<
    AnnouncementModel | null,
    Error
  >({
    queryKey: queryKeys.getAnnouncementKey(groupId, announcementId),
    queryFn: () => announcementsService.getAnnouncementById(groupId, announcementId)
  });

  if (error) {
    return (
      <SectionDisclaimer
        iconClassName='icon-status-alert'
        heading={translate('NetworkError')}
        message={translate('Error.ReloadingSubtitle')}
        buttonText={translate('Action.Retry')}
        onClick={() => refetch()}
      />
    );
  }
  if (isLoading) return <PostSkeleton />;
  if (!announcement) {
    return (
      <SectionDisclaimer
        iconClassName='icon-status-alert'
        heading={translate('Heading.PostUnavailable')}
        message={translate('Description.PostUnavailable')}
      />
    );
  }
  if (Number(CurrentUser.userId) !== announcement.createdBy) {
    return <Redirect to={announcementRoutes.announcementsRoute} />;
  }

  return <AnnouncementComposer groupId={groupId} publishedAnnouncement={announcement} />;
};

const AnnouncementRoutes = ({
  group,
  permissions,
  isGroupMember,
  policies,
  canViewAnnouncements,
  navigation
}: AnnouncementRoutesProps): JSX.Element | null => {
  const { translate } = useTranslation();
  const canCreateAnnouncements =
    policies.displayGroupAnnouncementPublishing && permissions.groupPostsPermissions.postToStatus;

  if (canViewAnnouncements === undefined) return null;
  if (!canViewAnnouncements) {
    return (
      <SectionDisclaimer
        iconClassName='icon-status-alert'
        message={translate('Heading.ForumsNotAvailable')}
      />
    );
  }

  return (
    <Switch>
      <Route path={announcementRoutes.announcementCreateRoute}>
        {canCreateAnnouncements ? (
          <AnnouncementComposer groupId={group.id} />
        ) : (
          <Redirect to={announcementRoutes.announcementsRoute} />
        )}
      </Route>
      <Route path={announcementRoutes.announcementEditRoute}>
        {canCreateAnnouncements ? (
          <AnnouncementEditRoute groupId={group.id} />
        ) : (
          <Redirect to={announcementRoutes.announcementsRoute} />
        )}
      </Route>
      <Route path={announcementRoutes.announcementRoute}>
        <AnnouncementDetail
          groupId={group.id}
          policies={policies}
          isGroupMember={isGroupMember}
          canCreateAnnouncements={canCreateAnnouncements}
        />
      </Route>
      <Route path={announcementRoutes.announcementsRoute}>
        <AnnouncementArchive
          groupId={group.id}
          canCreateAnnouncements={canCreateAnnouncements}
          navigation={navigation}
        />
      </Route>
    </Switch>
  );
};

export default AnnouncementRoutes;
