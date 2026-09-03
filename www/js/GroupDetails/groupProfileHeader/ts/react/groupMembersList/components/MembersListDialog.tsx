import React, { useCallback } from 'react';
import { useTranslation } from 'react-utilities';
import { Badge } from '@rbx/ui';
import { abbreviateNumber } from 'core-utilities';
import { UserListDialog, Action } from '@rbx/profile-platform';
import { GroupRole, GroupMember } from '../types';
import { useGroupMembers, RoleFilterOption } from '../hooks/useGroupMembers';
import { eventConstants } from '../constants/groupMembersListConstants';
import { logGroupPageClickEvent } from '../../shared/utils/logging';
import '../../../../css/groupMembersList/_membersListDialog.scss';
import RoleIcon from '../../shared/components/RoleIcon';
import {
  CommunityProductFeaturesContextProvider,
  useCommunityProductFeatures
} from '../../shared/contexts/CommunityProductFeaturesContext';
import useGroupOwner from '../../shared/hooks/useGroupOwner';
import { isCommunityOwner } from '../../shared/utils/communityOwnership';

interface MembersListDialogProps {
  open: boolean;
  onClose: () => void;
  groupId: number;
  userRole: GroupRole | null;
  roles: GroupRole[];
  hasSocialModules: boolean;
}

const MembersListDialogInner: React.FC<MembersListDialogProps> = ({
  open,
  onClose,
  userRole,
  groupId,
  roles,
  hasSocialModules
}) => {
  const { translate } = useTranslation();
  const { features } = useCommunityProductFeatures();
  const ownerUserId = useGroupOwner(groupId);
  const isOwnerRolesetDeprecated = features.IsOwnerRolesetDeprecated;

  const { filterOptions, defaultFilter, queryFunction, queryKey } = useGroupMembers({
    roles,
    userRole,
    groupId
  });

  const filterOptionLeadingElement = useCallback(
    (option: RoleFilterOption) =>
      hasSocialModules ? <RoleIcon role={option as GroupRole} size='Small' /> : undefined,
    [hasSocialModules]
  );

  const filterOptionTrailingElement = useCallback(
    (option: RoleFilterOption) =>
      option.memberCount && option.memberCount > 0 ? (
        <Badge
          className='role-selector-dropdown-badge'
          variant='standard'
          badgeContent={abbreviateNumber.getAbbreviatedValue(option.memberCount)}
        />
      ) : undefined,
    []
  );

  const onCtaAction = useCallback(
    (action: Action, userId: number) => {
      const suffix = action.charAt(0).toLowerCase() + action.slice(1);
      logGroupPageClickEvent({
        context: eventConstants.EventContext.MemberListDialog,
        groupId,
        clickTargetType: `memberListDialog.${suffix}`,
        clickTargetId: String(userId)
      });
    },
    [groupId]
  );

  const userDisplayNameTrailingLabel = useCallback(
    (user: GroupMember): string | undefined =>
      isCommunityOwner(user, ownerUserId, isOwnerRolesetDeprecated)
        ? translate('Label.Owner')
        : undefined,
    [isOwnerRolesetDeprecated, ownerUserId, translate]
  );

  const title = hasSocialModules ? translate('Heading.Members') : translate('Heading.Followers');

  return (
    <UserListDialog<GroupMember, RoleFilterOption>
      open={open}
      onClose={onClose}
      title={title}
      filterOptions={hasSocialModules ? filterOptions : undefined}
      defaultFilter={hasSocialModules ? defaultFilter : undefined}
      filterOptionLeadingElement={filterOptionLeadingElement}
      filterOptionTrailingElement={filterOptionTrailingElement}
      queryFunction={queryFunction}
      queryKey={queryKey}
      onCtaAction={onCtaAction}
      userDisplayNameTrailingLabel={userDisplayNameTrailingLabel}
    />
  );
};

const MembersListDialog: React.FC<MembersListDialogProps> = props => {
  const { groupId } = props;
  return (
    <CommunityProductFeaturesContextProvider groupId={groupId}>
      <MembersListDialogInner {...props} />
    </CommunityProductFeaturesContextProvider>
  );
};

export default MembersListDialog;
