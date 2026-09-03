import React, { useMemo } from 'react';
import {
  Thumbnail2d,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
  ThumbnailTypes
} from 'roblox-thumbnails';
import {
  IconButton,
  Menu,
  MenuItem,
  MenuSection,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import { Link } from 'react-style-guide';
import { AssignedRole, User } from '../../shared/types';
import groupConstants from '../../shared/constants/groupConstants';
import OwnerPill from '../../shared/components/OwnerPill';
import useIsCommunityOwner from '../../shared/hooks/useIsCommunityOwner';

export type OverflowAction = {
  label: string;
  action: (userId: number) => void;
  isVisible?: (userId: number, memberRoles?: Array<AssignedRole>) => boolean;
};

type MemberInfoDisplayProps = {
  user: User;
  groupId: number;
  content?: React.ReactNode;
  overflowActions?: Array<OverflowAction>;
  /** Roles held by this member, used by `overflowActions` visibility checks (e.g. rank gating). */
  memberRoles?: Array<AssignedRole>;
};

const getUsernameDisplayString = (username: string) => `@${username}`;

const MemberInfoDisplay: React.FC<MemberInfoDisplayProps> = ({
  user,
  groupId,
  content,
  overflowActions,
  memberRoles
}) => {
  const { userId } = user;
  const { translate } = useTranslation();
  const profileUrl = groupConstants.urls.getUserProfileURL(userId);
  const isOwner = useIsCommunityOwner(userId, groupId);

  const visibleActions = useMemo(
    () =>
      overflowActions?.filter(action =>
        action.isVisible ? action.isVisible(userId, memberRoles) : true
      ),
    [overflowActions, userId, memberRoles]
  );

  return (
    <div className='padding-large' key={userId}>
      <div className='flex items-start'>
        <div className='member-info-display-wrapper flex items-center grow-1'>
          <div className='member-info-display-member-column flex items-center shrink-0'>
            <Link className='member-info-display-avatar block' url={profileUrl}>
              <Thumbnail2d
                containerClass='radius-circle'
                type={ThumbnailTypes.avatarHeadshot}
                size={ThumbnailAvatarHeadshotSize.size48}
                targetId={userId}
                format={ThumbnailFormat.webp}
              />
            </Link>
            <div className='padding-left-medium text-overflow'>
              <div className='flex items-center'>
                <Link className='block text-label-medium text-overflow' url={profileUrl}>
                  {user.displayName}
                </Link>
                {isOwner && <OwnerPill className='member-info-display-name-trailing' />}
              </div>
              <Link
                className='block text-body-small padding-top-xsmall text-overflow'
                url={profileUrl}>
                {getUsernameDisplayString(user.username)}
              </Link>
            </div>
          </div>
          {content && <div className='member-info-display-content-column'>{content}</div>}
        </div>
        {visibleActions?.length ? (
          <Popover>
            <PopoverTrigger asChild>
              <IconButton
                icon='icon-filled-three-dots-vertical'
                ariaLabel={translate('Action.More')}
                variant='Utility'
              />
            </PopoverTrigger>
            <PopoverContent ariaLabel={translate('Label.OverflowMenu')}>
              <Menu>
                <MenuSection>
                  {visibleActions.map(action => (
                    <MenuItem
                      key={action.label}
                      title={action.label}
                      value={action.label}
                      onSelect={() => action.action(userId)}
                    />
                  ))}
                </MenuSection>
              </Menu>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </div>
  );
};

export default MemberInfoDisplay;
