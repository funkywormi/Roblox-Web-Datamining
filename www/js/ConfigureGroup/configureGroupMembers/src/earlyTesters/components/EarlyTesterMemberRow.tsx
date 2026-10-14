import type { FunctionComponent } from 'react';
import React, { useCallback } from 'react';
import { IconButton, ListItem } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import { ReturnPolicy, Thumbnail2d, ThumbnailTypes } from '@rbx/thumbnails';
import type { GroupUserWithRoles } from '../../clients/groups';
import DisabledPermissionTooltip from './DisabledPermissionTooltip';
import IneligibleEarlyTesterBadge from './IneligibleEarlyTesterBadge';

export type EarlyTesterMemberRowProps = {
  member: GroupUserWithRoles;
  divider?: 'None' | 'Full';
  onRemove: (member: GroupUserWithRoles) => void;
  canRemove?: boolean;
  readOnlyTooltip?: string;
  /** Dims the row and badges it, matching the publishing invite screen. */
  isIneligible?: boolean;
};

const formatUserHandle = (username: string) => `@${username}`;

const EarlyTesterMemberRow: FunctionComponent<EarlyTesterMemberRowProps> = ({
  member,
  divider = 'None',
  onRemove,
  canRemove = true,
  readOnlyTooltip = '',
  isIneligible = false,
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
          <span
            className={`flex shrink-0 radius-circle size-800 clip${
              isIneligible ? ' [opacity:0.5]' : ''
            }`}>
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
        <span className='items-center gap-small flex flex-row'>
          {isIneligible && <IneligibleEarlyTesterBadge />}
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
        </span>
      }
      className={`radius-medium padding-x-small [&_.padding-y-large]:padding-y-medium${
        isIneligible
          ? ' [&_.text-body-small]:[opacity:0.5] [&_.text-title-medium]:[opacity:0.5]'
          : ''
      }`}
    />
  );
};

export default EarlyTesterMemberRow;
