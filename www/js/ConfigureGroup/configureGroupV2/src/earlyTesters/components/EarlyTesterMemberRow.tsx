import type { FunctionComponent } from 'react';
import React, { useCallback } from 'react';
import { IconButton, ListItem } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import { ReturnPolicy, Thumbnail2d, ThumbnailTypes } from '@rbx/thumbnails';
import type { GroupUserWithRoles } from '../../clients/groups';
import DisabledPermissionTooltip from './DisabledPermissionTooltip';

export type EarlyTesterMemberRowProps = {
  member: GroupUserWithRoles;
  divider?: 'None' | 'Full';
  onRemove: (member: GroupUserWithRoles) => void;
  canRemove?: boolean;
  readOnlyTooltip?: string;
};

const formatUserHandle = (username: string) => `@${username}`;

const EarlyTesterMemberRow: FunctionComponent<EarlyTesterMemberRowProps> = ({
  member,
  divider = 'None',
  onRemove,
  canRemove = true,
  readOnlyTooltip = '',
}) => {
  const { translate } = useTranslation();
  const userId = member.user?.userId;
  const username = member.user?.username;

  const handleRemove = useCallback(() => {
    onRemove(member);
  }, [member, onRemove]);

  return (
    <ListItem
      isContained
      size='Small'
      divider={divider}
      title={member.user?.displayName ?? username}
      metadata={username ? formatUserHandle(username) : undefined}
      leading={
        userId == null ? undefined : (
          <span className='flex shrink-0 radius-circle size-800 clip'>
            <Thumbnail2d
              targetId={userId}
              type={ThumbnailTypes.avatarHeadshot}
              alt={translate('Label.AvatarThumbnail')}
              returnPolicy={ReturnPolicy.PlaceHolder}
              includeBackground={false}
            />
          </span>
        )
      }
      trailing={
        <DisabledPermissionTooltip
          isDisabled={!canRemove}
          title={readOnlyTooltip}
          className='inline-block cursor-not-allowed'>
          <IconButton
            icon='icon-regular-trash-can'
            ariaLabel={translate('Action.Remove')}
            variant='Utility'
            size='Small'
            isDisabled={!canRemove}
            className={canRemove ? undefined : 'pointer-events-none'}
            onClick={canRemove ? handleRemove : undefined}
          />
        </DisabledPermissionTooltip>
      }
      className='radius-medium padding-x-small [&_.padding-y-large]:padding-y-medium'
    />
  );
};

export default EarlyTesterMemberRow;
