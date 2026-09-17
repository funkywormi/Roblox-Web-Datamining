import { useCallback, useEffect, useState } from 'react';
import { V1UsersSearchGetLimitEnum } from '@rbx/client-users/v1';
import { useTranslation } from '@rbx/intl';
import type { User } from '../../../clients/users';
import usersClient from '../../../clients/users';
import TranslationNamespace from '../../../constants/TranslationNamespace';
import useDebouncedFunction from '../../../hooks/useDebouncedFunction';
import type { UserOptionsHook, UserStatus } from '../../types';
import useCurrentGroupUtils from '../serviceHook/useCurrentGroupUtils';

const useUserOptionsForOrgRoles: UserOptionsHook = (roleId: string) => {
  const { translate, translateWithNamespace } = useTranslation();
  const {
    isUserInGroup,
    isUserInvited,
    isUserInRole,
    isFetching: isGroupUtilsFetching,
    allInvitedUsersAndMembers,
    isLoadingAllInvitedUsersAndMembers,
  } = useCurrentGroupUtils({ roleId });

  const [userOptions, setUserOptions] = useState<User[]>([]);
  const [userStatus, setUserStatus] = useState<Map<number, UserStatus>>(new Map());
  const [isFetching, setIsFetching] = useState(false);
  const [hasValidSearch, setHasValidSearch] = useState(false);
  const noOptionsText = hasValidSearch
    ? translateWithNamespace(TranslationNamespace.GroupManagement, 'Label.NoMembersFound')
    : translate('Label.NeedMoreThanTwoCharacters');

  const filterAndUpdateUserStatus = useCallback(
    async (foundUsers: User[]) => {
      const usersWithId = foundUsers.filter(
        (foundUser): foundUser is User & { id: number } => foundUser.id !== undefined,
      );
      const updatedUsers = await Promise.all(
        usersWithId.map(async (foundUser) => {
          const [isMember, isInvited, isInRole] = await Promise.all([
            isUserInGroup(foundUser.id),
            isUserInvited(foundUser.id),
            isUserInRole(foundUser.id),
          ]);
          return { user: foundUser, isMember, isInvited, isInRole };
        }),
      );

      const newUserStatus = new Map<number, UserStatus>();

      const newUserOptions = updatedUsers
        .filter((u) => u.isInvited || u.isMember)
        .map((u) => {
          if (u.isInRole) {
            newUserStatus.set(u.user.id, { category: 'Added', disabled: true });
          } else if (u.isInvited) {
            newUserStatus.set(u.user.id, { category: 'InvitePending', disabled: false });
          } else {
            newUserStatus.delete(u.user.id);
          }
          return u.user;
        });

      setUserOptions(newUserOptions);
      setUserStatus(newUserStatus);
      setIsFetching(false);
    },
    [isUserInGroup, isUserInvited, isUserInRole],
  );

  useEffect(() => {
    if (allInvitedUsersAndMembers) {
      // oxlint-disable-next-line react/react-compiler -- filtering externally loaded memberships updates the hook's result state
      void filterAndUpdateUserStatus(allInvitedUsersAndMembers);
    }
  }, [allInvitedUsersAndMembers, filterAndUpdateUserStatus]);

  const updateUserSuggestionsInternal = useCallback(
    async (trimmedValue: string) => {
      if (isGroupUtilsFetching) {
        return;
      }
      let foundUsers: User[] = [];
      try {
        if (allInvitedUsersAndMembers) {
          const lowered = trimmedValue.toLowerCase();
          foundUsers = allInvitedUsersAndMembers.filter((user) => {
            return (
              user.name?.toLowerCase().includes(lowered) === true ||
              user.displayName?.toLowerCase().includes(lowered) === true ||
              user.id === parseInt(trimmedValue, 10)
            );
          });
        } else {
          const { data } = await usersClient.searchUsers(
            trimmedValue,
            V1UsersSearchGetLimitEnum.NUMBER_10,
          );
          foundUsers = data ?? [];

          const searchUserId = parseInt(trimmedValue, 10);
          if (!Number.isNaN(searchUserId)) {
            const searchUser = await usersClient.getUserById(searchUserId);
            foundUsers.unshift(searchUser);
          }
        }
      } catch {
        // swallow API failures so the consumer simply sees an empty result set
      }
      await filterAndUpdateUserStatus(foundUsers);
    },
    [isGroupUtilsFetching, allInvitedUsersAndMembers, filterAndUpdateUserStatus],
  );

  const [updateUserSuggestionsDebounced] = useDebouncedFunction(updateUserSuggestionsInternal, 200);

  const updateUserSuggestions = useCallback(
    (searchValue: string) => {
      const trimmedValue = searchValue.trim();
      setHasValidSearch(true);
      setIsFetching(true);
      if (allInvitedUsersAndMembers) {
        void updateUserSuggestionsInternal(trimmedValue);
      } else if (trimmedValue.length > 2) {
        updateUserSuggestionsDebounced(trimmedValue);
      } else {
        setIsFetching(false);
        setHasValidSearch(false);
      }
    },
    [allInvitedUsersAndMembers, updateUserSuggestionsDebounced, updateUserSuggestionsInternal],
  );

  return {
    userOptions,
    userStatus,
    isFetching: isFetching || isLoadingAllInvitedUsersAndMembers,
    noOptionsText,
    updateUserSuggestions,
  };
};

export default useUserOptionsForOrgRoles;
