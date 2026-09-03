import type { FunctionComponent, ReactNode } from 'react';
import React from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  MenuSection,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import { ReturnPolicy, Thumbnail2d, ThumbnailTypes } from '@rbx/thumbnails';
import { Tooltip } from '@rbx/ui';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import useMemberModerationActions from '../../hooks/useMemberModerationActions';
import { useGetGroupInfo } from '../../queries';
import type { Member } from '../../utils/constants';
import { GroupMembersMenuState } from '../../utils/constants';
import RemoveMemberDialog from './actions/RemoveMemberDialog';

export type GroupMembersRowProps = {
  member: Member;
  menuState: GroupMembersMenuState;
  content?: ReactNode;
  hideOverflow?: boolean;
};

/**
 * A single member row: avatar, names, an Owner/Pending badge, caller-supplied content and the
 * moderation overflow menu.
 */
const GroupMembersRow: FunctionComponent<GroupMembersRowProps> = ({
  member,
  menuState,
  content,
  hideOverflow = false,
}) => {
  const { translate } = useTranslation();
  const { organization, navigation } = useCurrentGroup();
  const { data: groupInfo } = useGetGroupInfo(organization?.groupId);
  const { overflowActions, isRemoveDialogOpen, closeRemoveDialog } = useMemberModerationActions(
    member,
    menuState,
  );

  const userId = member.user?.userId;
  const isInvited = menuState === GroupMembersMenuState.Invited;
  const isGroupOwner = userId !== undefined && userId === groupInfo?.ownerId;
  const profileUrl = userId !== undefined ? navigation.getUserProfileUrl?.(userId) : undefined;

  const overflowTrigger = (
    <IconButton
      icon='icon-regular-three-dots-vertical'
      ariaLabel={translate('Action.MoreOptions')}
      variant='Utility'
      size='Small'
      className='shrink-0 height-full'
    />
  );

  const overflowPlaceholder = (
    <IconButton
      icon='icon-regular-three-dots-vertical'
      ariaLabel={translate('Action.MoreOptions')}
      variant='Utility'
      size='Small'
      className='shrink-0 invisible'
      isDisabled
      aria-hidden
    />
  );

  const names = (
    <div className='flex flex-col min-width-0'>
      <div className='flex items-center gap-xsmall min-width-0'>
        <span className='text-label-medium text-truncate-end group-hover:underline'>
          {member.user?.displayName}
        </span>
        {isInvited && (
          <Tooltip arrow title={translate('Label.PendingPermissions')}>
            <span className='flex shrink-0'>
              <Badge variant='Neutral' label={translate('Label.Pending')} />
            </span>
          </Tooltip>
        )}
        {isGroupOwner && (
          <Badge variant='Neutral' label={translate('Label.Owner')} className='shrink-0' />
        )}
      </div>
      <span className='text-caption-medium content-muted text-truncate-end'>
        {`@${member.user?.username ?? ''}`}
      </span>
    </div>
  );

  return (
    <div
      className={`group/row flex items-center gap-medium padding-y-small padding-x-medium hover:bg-[var(--color-state-hover)] radius-medium${hideOverflow ? '' : ' max-[720px]:items-stretch'}`}>
      <div
        className={`flex items-center gap-medium grow-1 min-width-0${hideOverflow ? '' : ' max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-small'}`}>
        <div
          className={`flex items-center gap-small min-width-0 shrink-0 [width:240px]${hideOverflow ? '' : ' max-[720px]:[width:auto]'}`}>
          <span className='flex shrink-0 radius-circle size-800 clip'>
            {userId !== undefined && (
              <Thumbnail2d
                targetId={userId}
                type={ThumbnailTypes.avatarHeadshot}
                alt={translate('Label.AvatarThumbnail')}
                returnPolicy={ReturnPolicy.PlaceHolder}
                includeBackground={false}
              />
            )}
          </span>
          {profileUrl ? (
            <a href={profileUrl} className='group min-width-0 content-default no-underline'>
              {names}
            </a>
          ) : (
            names
          )}
        </div>

        <div
          className={`flex items-center min-width-0 grow-1${hideOverflow ? '' : ' max-[720px]:width-full'}`}>
          {content}
        </div>
      </div>

      {!hideOverflow && (
        <>
          {overflowActions.length > 0 ? (
            <Popover>
              <PopoverTrigger asChild>{overflowTrigger}</PopoverTrigger>
              <PopoverContent align='end' ariaLabel={translate('Action.MoreOptions')}>
                <Menu size='Small'>
                  <MenuSection>
                    {overflowActions.map((action) => (
                      <MenuItem
                        key={action.value}
                        value={action.value}
                        title={action.title}
                        className={action.isDestructive ? 'content-system-alert' : undefined}
                        onSelect={action.onSelect}
                      />
                    ))}
                  </MenuSection>
                </Menu>
              </PopoverContent>
            </Popover>
          ) : (
            overflowPlaceholder
          )}

          <RemoveMemberDialog
            open={isRemoveDialogOpen}
            onClose={closeRemoveDialog}
            member={member}
            username={member.user?.username}
          />
        </>
      )}
    </div>
  );
};

export default GroupMembersRow;
