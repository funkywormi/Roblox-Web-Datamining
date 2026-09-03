import React, { useCallback, useMemo, useState } from 'react';
import { Dropdown, Menu, MenuItem, MenuSection } from '@rbx/foundation-ui';
import { Loading } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { CurrentUser } from 'Roblox';
import { AssignedRole, Group, UserAndRoles } from '../../shared/types';
import groupMembersService from '../services/groupMembersService';
import groupsService from '../../shared/services/groupsService';
import useMemberModerationActions from '../hooks/useMemberModerationActions';
import useMembersQuery, {
  useMembersQueryUpdates,
  UseMembersQueryParams
} from '../hooks/useMembersQuery';
import useGroupRoles from '../hooks/useGroupRoles';
import MemberRolesList from '../components/MemberRolesList';
import SearchableMembersList from '../components/SearchableMembersList';
import RoleIcon from '../../shared/components/RoleIcon';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import { isCommunityOwner } from '../../shared/utils/communityOwnership';
import { computeManageableRoles } from '../utils/manageableRoles';
import { canModerateMemberByRank } from '../utils/memberModeration';

const MIGRATED_STATUS = 'Migrated';

type MembersTabProps = {
  group: Group;
};

const MembersTab: React.FC<MembersTabProps> = ({ group }) => {
  const { id: groupId } = group;
  const { translate } = useTranslation();
  const queryClient = useQueryClient();

  const { roles, isLoading: isLoadingRoles, isError: isErrorRoles } = useGroupRoles({
    group,
    includePrivate: true
  });
  const [filteredRoleId, setFilteredRoleId] = useState<number>();

  const useMembersQueryWithRoleId = (params: Omit<UseMembersQueryParams, 'filteredRoleId'>) =>
    useMembersQuery({ ...params, filteredRoleId, includePrivate: true });

  const { addRoleToMember, removeRoleFromMember, removeMember } = useMembersQueryUpdates({
    groupId,
    roles
  });

  // Aggregate gate: the acting user must be able to assign roles at all (owner, or has changeRank).
  const { features } = useCommunityProductFeatures();
  const isLoggedInUserOwner = isCommunityOwner(
    { userId: Number(CurrentUser.userId) },
    group.owner?.userId,
    features.IsOwnerRolesetDeprecated
  );
  const authedUserCanManageRanks =
    isLoggedInUserOwner || group.permissions?.groupMembershipPermissions.changeRank;
  const authedUserCanModerateMembers = Boolean(
    group.permissions?.groupMembershipPermissions.removeMembers ||
      group.permissions?.groupMembershipPermissions.banMembers
  );

  // The lexorank affordance is unified-groups only (flag on AND migrated); legacy groups stay rank-based.
  const isUnifiedUIEnabled = features.IsUnifiedUIEnabled === true;
  const { data: migrationStatus, isLoading: isMigrationStatusLoading } = useQuery({
    queryKey: ['groupMigrationStatus', groupId],
    queryFn: () => groupsService.getGroupMigrationStatus(groupId),
    enabled: isUnifiedUIEnabled
  });
  const isUnifiedGroup = isUnifiedUIEnabled && migrationStatus === MIGRATED_STATUS;

  // Role management and moderation both compare role position, so fetch the acting user's held
  // roles (members query filtered to self) whenever they can manage ranks or moderate members.
  const authedUserId = Number(CurrentUser.userId);
  const {
    queryKey: authedUserQueryKey,
    queryFn: authedUserQueryFn,
    getNextPageParam: authedUserGetNextPageParam,
    getItemsFromDataPages: getAuthedUserItems
  } = useMembersQuery({ groupId, filteredUserId: authedUserId, includePrivate: true });
  const { data: authedUserData } = useInfiniteQuery({
    queryKey: authedUserQueryKey,
    queryFn: authedUserQueryFn,
    getNextPageParam: authedUserGetNextPageParam,
    enabled: (Boolean(authedUserCanManageRanks) || authedUserCanModerateMembers) && authedUserId > 0
  });
  const authedUserRoles = useMemo(
    () => (authedUserData ? getAuthedUserItems(authedUserData)[0]?.roles ?? [] : undefined),
    [authedUserData, getAuthedUserItems]
  );

  const authedUserRank = group.role?.rank;

  // Kick/ban are only offered for members the acting user outranks, matching role management.
  const canModerateMember = useCallback(
    (memberRoles: Array<AssignedRole> = []) =>
      canModerateMemberByRank({
        isLoggedInUserOwner,
        roles,
        authedUserRoles,
        targetMemberRoles: memberRoles
      }),
    [isLoggedInUserOwner, roles, authedUserRoles]
  );

  const { overflowActions } = useMemberModerationActions({
    group,
    onKick: (userId: number) => removeMember(userId),
    onBan: (userId: number) => {
      removeMember(userId);
      // eslint-disable-next-line no-void
      void queryClient.invalidateQueries({ queryKey: ['group-banned-users', groupId] });
    },
    canModerateMember
  });

  const manageableRoles = useMemo(
    () =>
      computeManageableRoles({
        authedUserCanManageRanks,
        isLoggedInUserOwner,
        isUnifiedUIEnabled,
        isMigrationStatusLoading,
        isUnifiedGroup,
        roles,
        authedUserRoles,
        authedUserRank
      }),
    [
      authedUserCanManageRanks,
      isLoggedInUserOwner,
      isUnifiedUIEnabled,
      isMigrationStatusLoading,
      isUnifiedGroup,
      roles,
      authedUserRoles,
      authedUserRank
    ]
  );

  const onRoleChanged = useCallback((value: string) => {
    if (value === '') {
      setFilteredRoleId(undefined);
    } else {
      setFilteredRoleId(parseInt(value, 10));
    }
  }, []);

  const assignRoleToUser = useCallback(
    async (roleId: number, userId: number) => {
      await groupMembersService.assignRoleToUser({
        groupId,
        roleId,
        userId
      });
      await addRoleToMember(userId, roleId);
    },
    [groupId, addRoleToMember]
  );

  const unassignRoleFromUser = useCallback(
    async (roleId: number, userId: number) => {
      await groupMembersService.unassignRoleFromUser({
        groupId,
        roleId,
        userId
      });
      await removeRoleFromMember(userId, roleId);
    },
    [groupId, removeRoleFromMember]
  );

  const renderMemberInfoContent = useCallback(
    ({ user: member, roles: memberRoles }: UserAndRoles) => {
      if (!memberRoles.length && !manageableRoles?.length) {
        return null;
      }

      const { userId } = member;

      return (
        <MemberRolesList
          className='grow-1'
          currentRoles={memberRoles}
          manageableRoles={manageableRoles}
          assignRoleCallback={(roleId: number) => assignRoleToUser(roleId, userId)}
          unassignRoleCallback={(roleId: number) => unassignRoleFromUser(roleId, userId)}
        />
      );
    },
    [manageableRoles, assignRoleToUser, unassignRoleFromUser]
  );

  if (isLoadingRoles) {
    return <Loading />;
  }

  if (isErrorRoles) {
    return <div className='padding-large text-center'>{translate('NetworkError')}</div>;
  }

  const roleDropdown = (
    <Dropdown
      className='grow-1 members-tab-roles-dropdown'
      size='Medium'
      placeholder=''
      value={filteredRoleId ? filteredRoleId.toString() : 'all-roles'}
      onValueChange={onRoleChanged}>
      <Menu>
        <MenuSection>
          <MenuItem key={-1} value='all-roles' title={translate('Label.AllRoles')} />
          <React.Fragment>
            {roles.map(role => (
              <MenuItem
                key={role.id}
                value={role.id.toString()}
                title={`${role.name} (${role.memberCount ?? 0})`}
                leading={<RoleIcon role={role} size='XSmall' />}
              />
            ))}
          </React.Fragment>
        </MenuSection>
      </Menu>
    </Dropdown>
  );

  return (
    <SearchableMembersList
      className='width-full'
      groupId={groupId}
      useQuery={useMembersQueryWithRoleId}
      renderContent={renderMemberInfoContent}
      overflowActions={overflowActions}
      customControls={roleDropdown}
      searchPlaceholder={translate('Label.SearchMembers')}
      emptyMessage={translate('Label.NoMembersInRole')}
    />
  );
};

export default MembersTab;
