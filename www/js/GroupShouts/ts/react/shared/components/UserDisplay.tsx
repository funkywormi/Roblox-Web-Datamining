import React, { useCallback, useState } from 'react';
import { Link, Tooltip } from 'react-style-guide';
import { Endpoints } from 'Roblox';
import { Thumbnail2d, ThumbnailAvatarHeadshotSize, ThumbnailTypes } from 'roblox-thumbnails';
import { VerifiedBadgeIconContainer, BadgeSizes } from 'roblox-badges';
import abbreviateTimeUtil from '../utils/abbreviateTime';
import UserRolesListDialog from './UserRolesListDialog';
import OwnerPill from './OwnerPill';
import useIsCommunityOwner from '../hooks/useIsCommunityOwner';

export const USER_DISPLAY_AVATAR_USERNAME_LINK_CLASS =
  'group-forums-user-display-avatar-username-link';
const SEPARATOR = '•';

export type UserDisplayProps = {
  userId: number;
  groupId: number;
  userDisplayName: string;
  hasVerifiedBadge: boolean;
  groupRoleName: string;
  createdTime: string;
  // Optional slot rendered at the very end of the meta row (after the role), preceded by the same
  // `•` separator. Used by forums to surface a post's support-ticket status inline with the byline.
  metaTrailing?: React.ReactNode;
};

const UserDisplay = ({
  userId,
  groupId,
  createdTime,
  userDisplayName,
  hasVerifiedBadge,
  groupRoleName,
  metaTrailing
}: UserDisplayProps): JSX.Element | null => {
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const openRolesDialog = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setRolesDialogOpen(true);
  }, []);
  const closeRolesDialog = useCallback(() => {
    setRolesDialogOpen(false);
  }, []);

  const onRoleNameKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        openRolesDialog(event);
      }
    },
    [openRolesDialog]
  );

  const isOwner = useIsCommunityOwner(userId, groupId);
  const createdDate = new Date(createdTime);
  return (
    <div className='group-forums-user-display'>
      <Link
        className={`${USER_DISPLAY_AVATAR_USERNAME_LINK_CLASS} text-default`}
        url={Endpoints.getAbsoluteUrl(`/users/${userId}/profile`)}>
        <div className='group-forums-user-display-avatar-container avatar'>
          <Thumbnail2d
            type={ThumbnailTypes.avatarHeadshot}
            size={ThumbnailAvatarHeadshotSize.size48}
            targetId={userId}
            containerClass='group-forums-user-display-avatar-thumbnail avatar-card-image'
            altName={userDisplayName}
          />
        </div>
        <span className='group-forums-user-display-avatar-username-link-username'>
          {userDisplayName}
        </span>
        {hasVerifiedBadge && (
          <VerifiedBadgeIconContainer
            overrideImgClass='verified-badge-icon-user-display'
            size={BadgeSizes.FOOTER}
            titleText={userDisplayName}
          />
        )}
        {isOwner && <OwnerPill />}
      </Link>
      <div className='user-display-meta text-default text-overflow'>
        &nbsp;
        {SEPARATOR}
        &nbsp;
        <Tooltip
          id='user-display-time-tooltip'
          containerClassName='user-display-tooltip-container'
          content={createdDate.toLocaleString()}
          placement='bottom'>
          <span className='user-display-time'>
            {abbreviateTimeUtil.abbreviateTime(createdDate)}
          </span>
        </Tooltip>
        &nbsp;
        {SEPARATOR}
        &nbsp;
        <span
          role='button'
          tabIndex={0}
          className='user-display-role-name user-display-role-name-interactive'
          onClick={openRolesDialog}
          onKeyDown={onRoleNameKeyDown}>
          {groupRoleName}
        </span>
        {metaTrailing != null && (
          <React.Fragment>
            &nbsp;
            {SEPARATOR}
            &nbsp;
            {metaTrailing}
          </React.Fragment>
        )}
      </div>
      {rolesDialogOpen && (
        <UserRolesListDialog
          open={rolesDialogOpen}
          onClose={closeRolesDialog}
          groupId={groupId}
          userId={userId}
        />
      )}
    </div>
  );
};

export default UserDisplay;
