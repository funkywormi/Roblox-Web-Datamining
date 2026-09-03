import React, { useCallback, useMemo } from 'react';
import { Link, useSystemFeedback } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import { Group } from '../../shared/types';
import { GroupBan } from '../types';
import { clearContent, unbanUser } from '../../configureGroupV2/services/groupBanService';
import useBannedUsersQuery, { useBannedUsersQueryUpdates } from '../hooks/useBannedUsersQuery';
import groupConstants from '../../shared/constants/groupConstants';
import SearchableMembersList from '../components/SearchableMembersList';

type BannedTabProps = {
  group: Group;
};

const BannedTab: React.FC<BannedTabProps> = ({ group }) => {
  const { id: groupId } = group;
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();

  const { removeBan } = useBannedUsersQueryUpdates({ groupId });

  const onRemoveContentClicked = useCallback(
    async (userId: number) => {
      const success = await clearContent({
        groupId,
        userId
      });
      if (success) {
        systemFeedbackService.success(translate('Message.RemoveContentSuccess'));
      } else {
        systemFeedbackService.warning(translate('Message.DeleteWallPostsByUserError'));
      }
    },
    [groupId, systemFeedbackService, translate]
  );

  const onUnbanClicked = useCallback(
    async (userId: number) => {
      const success = await unbanUser({
        groupId,
        userId
      });
      if (success) {
        removeBan(userId);
        systemFeedbackService.success(translate('Message.UnbanUserSuccess'));
      } else {
        systemFeedbackService.warning(translate('Message.UnbanUserError'));
      }
    },
    [groupId, systemFeedbackService, translate, removeBan]
  );

  const authedUserCanRemoveContent =
    group.permissions?.groupPostsPermissions.deleteFromWall ?? false;

  const overflowActions = useMemo(() => {
    const actions = [{ label: translate('Action.UnbanUser'), action: onUnbanClicked }];

    if (authedUserCanRemoveContent) {
      actions.push({
        label: translate('Action.RemoveContent'),
        action: onRemoveContentClicked
      });
    }

    return actions;
  }, [authedUserCanRemoveContent, onUnbanClicked, onRemoveContentClicked, translate]);

  const renderMemberInfoContent = useCallback(
    (banInfo: GroupBan, index: number) => {
      const { actingUser } = banInfo;
      return (
        <div className='flex justify-between items-center grow-1'>
          <div className='text-body-medium'>
            {translate('Label.BannedBy')}{' '}
            <span className='inline'>
              <Link
                className='text-link'
                url={groupConstants.urls.getUserProfileURL(actingUser.user.userId)}>
                {actingUser.user.username}
              </Link>
            </span>
          </div>
        </div>
      );
    },
    [translate]
  );

  return (
    <SearchableMembersList
      className='width-full'
      groupId={groupId}
      useQuery={useBannedUsersQuery}
      renderContent={renderMemberInfoContent}
      overflowActions={overflowActions}
      searchPlaceholder={translate('Label.SearchBannedUsers')}
      emptyMessage={translate('Label.NoBannedUsers')}
    />
  );
};

export default BannedTab;
