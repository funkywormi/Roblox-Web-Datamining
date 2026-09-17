import React, { useMemo } from 'react';
import { CurrentUser } from 'Roblox';
import { IconButton } from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import UserDisplay from '../../shared/components/UserDisplay';
import { AnnouncementModel } from '../types';
import groupAnnouncementsConstants from '../constants/groupAnnouncementsConstants';
import AnnouncementMenu from './AnnouncementMenu';

type AnnouncementHeaderProps = {
  announcement: AnnouncementModel;
  groupId: number;
  canCreateAnnouncements: boolean;
  headerClassName: string;
  menuClassName: string;
  menuButtonTestId: string;
  onDelete: () => void;
  onEdit: () => void;
  onMenuButtonClick?: (event?: React.MouseEvent) => void;
};

const AnnouncementHeader = ({
  announcement,
  groupId,
  canCreateAnnouncements,
  headerClassName,
  menuClassName,
  menuButtonTestId,
  onDelete,
  onEdit,
  onMenuButtonClick
}: AnnouncementHeaderProps): JSX.Element => {
  const { translate } = useTranslation();
  const canEditAnnouncement =
    canCreateAnnouncements && Number(CurrentUser.userId) === announcement.createdBy;
  const reportUrl = useMemo(
    () =>
      groupAnnouncementsConstants.urls.reportAbuseRevamp({
        targetId: announcement.id,
        submitterId: CurrentUser.userId,
        abuseVector: 'group_announcement',
        custom: { stringId: groupId.toString() }
      }),
    [announcement.id, groupId]
  );

  return (
    <div className={headerClassName}>
      {announcement.creatorInfo && (
        <UserDisplay
          userId={announcement.createdBy}
          groupId={groupId}
          createdTime={announcement.createdAt}
          userDisplayName={announcement.creatorInfo.displayName}
          hasVerifiedBadge={announcement.creatorInfo.hasVerifiedBadge}
          groupRoleName={announcement.creatorInfo.groupRoleName || translate('Label.FormerMember')}
        />
      )}
      <div className={menuClassName}>
        <AnnouncementMenu
          announcementId={announcement.id}
          groupId={groupId}
          onDelete={onDelete}
          onEdit={onEdit}
          reportUrl={reportUrl}
          canCreateAnnouncements={canCreateAnnouncements}
          canEditAnnouncement={canEditAnnouncement}
          button={
            <IconButton
              as='button'
              icon='icon-filled-three-dots-horizontal'
              variant='Utility'
              size='Medium'
              ariaLabel={translate('Action.More')}
              data-testid={menuButtonTestId}
              onClick={onMenuButtonClick}
            />
          }
        />
      </div>
    </div>
  );
};

AnnouncementHeader.defaultProps = {
  onMenuButtonClick: undefined
};

export default AnnouncementHeader;
