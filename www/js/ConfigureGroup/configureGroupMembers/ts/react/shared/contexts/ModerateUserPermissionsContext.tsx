import React, { createContext, useContext } from 'react';
import { CurrentUser } from 'Roblox';
import { GroupPermissions, ModerateUserPermissionsState } from '../types';

const ModerateUserPermissionsContext = createContext<ModerateUserPermissionsState | undefined>(
  undefined
);

export const useModerateUserPermissions = (): ModerateUserPermissionsState => {
  const context = useContext(ModerateUserPermissionsContext);
  if (!context) {
    throw new Error(
      'useModerateUserPermissions must be used within a ModerateUserPermissionsProvider'
    );
  }
  return context;
};

export interface ModerateUserPermissionsProviderProps {
  permissions: GroupPermissions;
  children: React.ReactNode;
}

export const ModerateUserPermissionsProvider: React.FC<ModerateUserPermissionsProviderProps> = ({
  permissions,
  children
}) => {
  const currentUserId = CurrentUser.isAuthenticated ? Number(CurrentUser.userId) : 0;

  const canKickUser = (authorId: number) => {
    if (currentUserId === authorId) return false;
    return permissions?.groupMembershipPermissions?.removeMembers || false;
  };

  const canBanUser = (authorId: number) => {
    if (currentUserId === authorId) return false;
    return permissions?.groupMembershipPermissions?.banMembers || false;
  };

  const canBlockUser = (authorId: number) => {
    return authorId !== currentUserId;
  };

  return (
    <ModerateUserPermissionsContext.Provider
      value={{
        canKickUser,
        canBanUser,
        canBlockUser,
        canDeleteAllPosts: permissions?.groupPostsPermissions?.deleteFromWall || false
      }}>
      {children}
    </ModerateUserPermissionsContext.Provider>
  );
};
