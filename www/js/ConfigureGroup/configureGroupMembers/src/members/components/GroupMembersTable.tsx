import type { FunctionComponent, ReactNode } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { Dropdown, Menu, MenuItem, MenuSection, ProgressCircle } from '@rbx/foundation-ui';
import { useTranslation, withTranslation } from '@rbx/intl';
import type { GroupRoleMetadata } from '../../clients/groups';
import EmptyState from '../../components/EmptyState';
import TranslationNamespace from '../../constants/TranslationNamespace';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import {
  useGetGroupUsersWithRoles,
  useGetGroupsRoles,
  useGetInvitationsWithRole,
  useGetUserByUsername,
} from '../../queries';
import type { Member } from '../../utils/constants';
import {
  DefaultMemberRoleId,
  DefaultMemberRoleIdNumber,
  GroupMembersMenuState,
  GuestRoleRank,
  MembersPageSize,
} from '../../utils/constants';
import RemoveFromRoleButton from './actions/RemoveFromRoleButton';
import PaginatedMemberList from './common/PaginatedMemberList';
import RoleIcon from './common/RoleIcon';
import SearchInput from './common/SearchInput';
import emptyStateIllustrations from './emptyStateIllustrations';
import GroupMemberRoleChips from './GroupMemberRoleChips';
import GroupMembersRow from './GroupMembersRow';

export type GroupMembersTableProps = {
  menuState: GroupMembersMenuState;
  roleFilter?: GroupRoleMetadata | null;
  isRoleMembersPage?: boolean;
  toolbarStart?: ReactNode;
  emptyStateAction?: ReactNode;
};

/**
 * Searchable, paginated list of a group's members or pending invitations for a single role,
 * defaulting to the default member role. All actions on a row are gated by resolved permissions.
 */
const GroupMembersTable: FunctionComponent<GroupMembersTableProps> = ({
  menuState,
  roleFilter = null,
  isRoleMembersPage = false,
  toolbarStart,
  emptyStateAction,
}) => {
  const { translate, translateWithNamespace } = useTranslation();
  const { organization, permissions } = useCurrentGroup();
  const { data: roles, isLoading: isRolesLoading } = useGetGroupsRoles(organization?.groupId);

  const [selectedRoleValue, setSelectedRoleValue] = useState<string>(DefaultMemberRoleId);
  const [searchedUsername, setSearchedUsername] = useState<string>('');
  const [page, setPage] = useState(0);
  const [memberPageCursors, setMemberPageCursors] = useState<(string | null | undefined)[]>([]);
  const [invitationPageTokens, setInvitationPageTokens] = useState<(string | null | undefined)[]>(
    [],
  );

  const isInvited = menuState === GroupMembersMenuState.Invited;
  const canFetchInvitations = permissions?.canInviteMembers === true && isInvited;

  const sortedRoles = useMemo(() => {
    const selectableRoles = (roles ?? []).filter((role) => role.rank !== GuestRoleRank);
    return [
      ...selectableRoles.filter((role) => role.id === DefaultMemberRoleIdNumber),
      ...selectableRoles.filter((role) => role.id !== DefaultMemberRoleIdNumber).toReversed(),
    ];
  }, [roles]);

  const activeRole = useMemo(() => {
    if (isRoleMembersPage) {
      return roleFilter;
    }
    return (
      sortedRoles.find((role) => role.id?.toString() === selectedRoleValue) ??
      sortedRoles[0] ??
      null
    );
  }, [isRoleMembersPage, roleFilter, selectedRoleValue, sortedRoles]);

  const pagingKey = `${menuState}:${activeRole?.id ?? ''}:${searchedUsername}`;
  const [renderedPagingKey, setRenderedPagingKey] = useState(pagingKey);
  if (renderedPagingKey !== pagingKey) {
    setRenderedPagingKey(pagingKey);
    setPage(0);
    setMemberPageCursors([]);
    setInvitationPageTokens([]);
  }

  const { data: searchedUser, isFetching: isSearching } = useGetUserByUsername(searchedUsername);
  const hasUnmatchedSearch = searchedUsername !== '' && !isSearching && !searchedUser;

  const isFilterReady = isRoleMembersPage || !isRolesLoading;

  const membersEnabled = !isInvited && !hasUnmatchedSearch && isFilterReady;

  const isAllRolesFilter = !isRoleMembersPage && activeRole?.id === DefaultMemberRoleIdNumber;
  const searchRoleId = isAllRolesFilter && searchedUser ? null : activeRole?.id;

  const {
    data: membersPage,
    isLoading: isMembersLoading,
    isFetching: isMembersFetching,
    isError: isMembersError,
    refetch: refetchMembers,
  } = useGetGroupUsersWithRoles(
    organization?.groupId ?? '',
    searchRoleId,
    MembersPageSize,
    memberPageCursors[page],
    { enabled: membersEnabled, filteredUserId: searchedUser?.id },
  );

  const {
    data: invitationsPage,
    isLoading: isInvitationsLoading,
    isFetching: isInvitationsFetching,
    isError: isInvitationsError,
    refetch: refetchInvitations,
  } = useGetInvitationsWithRole(
    canFetchInvitations ? organization?.id : undefined,
    canFetchInvitations ? (activeRole?.id?.toString() ?? DefaultMemberRoleId) : undefined,
    invitationPageTokens[page],
    MembersPageSize,
    !activeRole || activeRole.id === DefaultMemberRoleIdNumber,
    canFetchInvitations && isFilterReady,
  );

  const members: Member[] = useMemo(() => {
    if (isInvited) {
      return (
        invitationsPage?.invitationRoles.flatMap((invitation) => {
          if (!invitation) {
            return [];
          }
          const invitedUser = invitationsPage.invitationsUserMap.get(invitation.userId);
          return [
            {
              user: {
                userId: Number.parseInt(invitation.userId, 10),
                displayName: invitedUser?.displayName,
                username: invitedUser?.name,
              },
              roles:
                roles?.filter(
                  (role) =>
                    role.id !== undefined && invitation.roleIds.includes(role.id.toString()),
                ) ?? [],
              invitationId: invitation.invitationId,
            },
          ];
        }) ?? []
      );
    }

    return membersPage?.data ?? [];
  }, [invitationsPage, isInvited, membersPage, roles]);

  const isPageSettled = isInvited
    ? canFetchInvitations && !isInvitationsLoading && !isInvitationsFetching
    : membersEnabled && !isMembersLoading && !isMembersFetching && !isSearching;
  if (page > 0 && members.length === 0 && isPageSettled) {
    setPage(page - 1);
  }

  const onSearchSubmit = useCallback((value: string) => setSearchedUsername(value.trim()), []);
  const onSearchClear = useCallback(() => setSearchedUsername(''), []);

  const renderMember = useCallback(
    (member: Member) => (
      <GroupMembersRow
        key={member.user?.userId}
        member={member}
        menuState={menuState}
        hideOverflow={isRoleMembersPage}
        content={
          isRoleMembersPage ? (
            <span className='margin-left-auto invisible group-hover/row:visible max-[720px]:visible'>
              <RemoveFromRoleButton member={member} menuState={menuState} role={activeRole} />
            </span>
          ) : (
            <GroupMemberRoleChips member={member} menuState={menuState} />
          )
        }
      />
    ),
    [menuState, isRoleMembersPage, activeRole],
  );

  // The searched-but-empty case keeps the plain "No results" text; the genuinely
  // empty list gets the designed empty state (icon + copy + invite CTA).
  const emptyState = hasUnmatchedSearch ? (
    <div className='padding-large text-align-x-center text-body-medium content-muted'>
      {translate('Label.NoResults')}
    </div>
  ) : (
    <EmptyState
      illustration={isInvited ? emptyStateIllustrations.invites : emptyStateIllustrations.members}
      title={translate(isInvited ? 'Label.NoPendingInvitations' : 'Label.NoMembers')}
      description={translate('Description.NoMembers')}
      action={emptyStateAction}
    />
  );

  const onRetry = useCallback(() => {
    if (isInvited) {
      void refetchInvitations();
    } else {
      void refetchMembers();
    }
  }, [isInvited, refetchInvitations, refetchMembers]);

  const isNextDisabled = useMemo(() => {
    if (isInvited) {
      return (
        !invitationsPage?.invitationsPageToken ||
        (invitationsPage.invitationRoles?.length ?? 0) < MembersPageSize
      );
    }

    return !membersPage?.nextPageCursor || (membersPage.data?.length ?? 0) < MembersPageSize;
  }, [invitationsPage, isInvited, membersPage]);

  const goToPreviousPage = useCallback(() => {
    setPage((previousPage) => previousPage - 1);
  }, []);

  const goToNextPage = useCallback(() => {
    const nextPage = page + 1;

    if (isInvited) {
      setInvitationPageTokens((previousTokens) => {
        const updatedTokens = [...previousTokens];
        updatedTokens[nextPage] = invitationsPage?.invitationsPageToken;
        return updatedTokens;
      });
    } else {
      setMemberPageCursors((previousCursors) => {
        const updatedCursors = [...previousCursors];
        updatedCursors[nextPage] = membersPage?.nextPageCursor;
        return updatedCursors;
      });
    }

    setPage(nextPage);
  }, [invitationsPage, isInvited, membersPage, page]);

  if (!isFilterReady) {
    return (
      <div className='flex flex-col gap-medium width-full'>
        <ProgressCircle
          variant='Indeterminate'
          size='Medium'
          ariaLabel={translate('Label.Loading')}
        />
      </div>
    );
  }

  const showSearch = !isInvited;
  const showRoleFilter = !isRoleMembersPage;
  const showToolbar = Boolean(toolbarStart) || showSearch || showRoleFilter;

  return (
    <div className='flex flex-col gap-medium width-full'>
      {showToolbar && (
        <div className='flex items-center gap-small width-full'>
          {toolbarStart && <div className='shrink-0'>{toolbarStart}</div>}
          {(showSearch || showRoleFilter) && (
            <div className='flex items-center gap-small min-width-0 grow-1'>
              {showSearch && (
                <div className='min-width-0 grow-2 basis-0'>
                  <SearchInput
                    className='width-full'
                    size='Medium'
                    placeholder={translate('Label.SearchMembers')}
                    onSubmit={onSearchSubmit}
                    onClear={onSearchClear}
                  />
                </div>
              )}
              {showRoleFilter && (
                <div className='grow-1 basis-0 min-width-150'>
                  <Dropdown
                    className='width-full'
                    size='Medium'
                    placeholder={translate('Action.FilterBy')}
                    value={activeRole?.id?.toString() ?? selectedRoleValue}
                    onValueChange={setSelectedRoleValue}>
                    <Menu size='Medium'>
                      <MenuSection>
                        {sortedRoles.map((role) => {
                          const isAllRoles = role.id === DefaultMemberRoleIdNumber;
                          return (
                            <MenuItem
                              key={role.id}
                              value={role.id?.toString() ?? ''}
                              title={
                                isAllRoles
                                  ? translateWithNamespace(
                                      TranslationNamespace.Groups,
                                      'Label.AllRoles',
                                    )
                                  : (role.name ?? '')
                              }
                              leading={
                                isAllRoles ? undefined : (
                                  <RoleIcon
                                    roleId={role.id}
                                    color={role.color}
                                    isPrivate={role.isPrivate}
                                  />
                                )
                              }
                            />
                          );
                        })}
                      </MenuSection>
                    </Menu>
                  </Dropdown>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <PaginatedMemberList<Member>
        items={members}
        isLoading={isInvited ? isInvitationsLoading : isMembersLoading || isSearching}
        isFetching={isInvited ? isInvitationsFetching : isMembersFetching}
        isError={isInvited ? isInvitationsError : isMembersError}
        renderItem={renderMember}
        emptyState={emptyState}
        onRetry={onRetry}
        hideResults={hasUnmatchedSearch && !isInvited}
        page={page}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        isPreviousDisabled={page === 0}
        isNextDisabled={isNextDisabled}
      />
    </div>
  );
};

export default withTranslation(GroupMembersTable, [
  TranslationNamespace.Groups,
  TranslationNamespace.Organization,
  TranslationNamespace.GroupManagement,
]);
