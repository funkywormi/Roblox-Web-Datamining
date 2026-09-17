import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-utilities';
import AnnouncementDisplay from '../components/AnnouncementDisplay';
import announcementsService from '../services/announcementsService';
import { GroupDetailsPolicies } from '../types';
import announcementRoutes from '../constants/announcementRoutes';
import PostNavigation from '../../groupForums/components/PostNavigation';
import PostSkeleton from '../../groupForums/components/PostSkeleton';
import SectionHeader from '../../shared/components/SectionHeader';
import SectionDisclaimer from '../../shared/components/SectionDisclaimer';
import queryKeys from '../utils/queryKeys';

type AnnouncementDetailProps = {
  groupId: number;
  policies: GroupDetailsPolicies;
  isGroupMember: boolean;
  canCreateAnnouncements: boolean;
};

const AnnouncementDetail = ({
  groupId,
  policies,
  isGroupMember,
  canCreateAnnouncements
}: AnnouncementDetailProps): JSX.Element => {
  const { announcementId } = useParams<{ announcementId: string }>();
  const history = useHistory();
  const queryClient = useQueryClient();
  const { translate } = useTranslation();
  const { data: announcement, error, isLoading, refetch } = useQuery({
    queryKey: queryKeys.getAnnouncementKey(groupId, announcementId),
    queryFn: () => announcementsService.getAnnouncementById(groupId, announcementId)
  });

  const archiveLabel = translate('Heading.Announcements');
  const onBack = () => history.push(announcementRoutes.announcementsRoute);
  const onDeleted = () => {
    queryClient.removeQueries({ queryKey: queryKeys.getAnnouncementKey(groupId, announcementId) });
    onBack();
  };

  let content: JSX.Element;

  if (error) {
    content = (
      <SectionDisclaimer
        iconClassName='icon-status-alert'
        heading={translate('NetworkError')}
        message={translate('Error.ReloadingSubtitle')}
        buttonText={translate('Action.Retry')}
        onClick={() => refetch()}
      />
    );
  } else if (isLoading) {
    content = <PostSkeleton />;
  } else if (!announcement) {
    content = (
      <SectionDisclaimer
        iconClassName='icon-status-alert'
        heading={translate('Heading.PostUnavailable')}
        message={translate('Description.PostUnavailable')}
        buttonText={archiveLabel}
        onClick={onBack}
      />
    );
  } else {
    content = (
      <AnnouncementDisplay
        announcement={announcement}
        groupId={groupId}
        policies={policies}
        isMemberOfGroup={isGroupMember}
        canCreateAnnouncements={canCreateAnnouncements}
        truncateContent={false}
        onRefetchAnnouncement={() => refetch()}
        onDeleted={onDeleted}
        onEditAnnouncement={selectedAnnouncement =>
          history.push(announcementRoutes.getAnnouncementEditRoute(selectedAnnouncement.id), {
            announcement: selectedAnnouncement
          })
        }
      />
    );
  }

  return (
    <div className='group-announcement-detail'>
      <PostNavigation
        categoryName={archiveLabel}
        backRoute={announcementRoutes.announcementsRoute}
        postTitle={announcement?.title}
        containerClassName='hide-on-native'
      />
      <SectionHeader
        headerText={archiveLabel}
        onBack={onBack}
        containerClassName='show-on-native'
      />
      <div className='group-section-content'>{content}</div>
    </div>
  );
};

export default AnnouncementDetail;
