import React from 'react';
import BlockUserModal from '../../shared/components/dialogs/BlockUserDialog';
import BanUserModal from '../../shared/components/dialogs/BanUserDialog';
import DeleteForumEntityModal from '../../shared/components/dialogs/DeleteForumEntityDialog';
import HideForumEntityModal from '../../shared/components/dialogs/HideForumEntityDialog';
import KickUserModal from '../../shared/components/dialogs/KickUserDialog';
import type { Group, GroupChannelPermissions, GroupPermissions } from '../../shared/types';
import type { CategoriesNavigationComponent } from './Categories';
import ForumProviders from './ForumProviders';
import ForumRoutes from './ForumRoutes';

type GroupForumsProps = {
  group: Group;
  permissions: GroupPermissions;
  channelsPermissions: GroupChannelPermissions[];
  userId: number;
  isGroupMember: boolean;
  canViewForums: boolean;
  isOwner: boolean;
  categoriesNavigation?: CategoriesNavigationComponent;
};

const GroupForums = ({
  group,
  permissions,
  channelsPermissions,
  userId,
  isGroupMember,
  canViewForums,
  isOwner,
  categoriesNavigation
}: GroupForumsProps): JSX.Element | null => {
  if (!canViewForums) return null;

  return (
    <ForumProviders
      permissions={permissions}
      channelsPermissions={channelsPermissions}
      groupId={group.id}
      isOwner={isOwner}
      isGroupMember={isGroupMember}>
      <ForumRoutes
        group={group}
        userId={userId}
        isOwner={isOwner}
        categoriesNavigation={categoriesNavigation}
      />
      <BlockUserModal />
      <BanUserModal />
      <KickUserModal />
      <HideForumEntityModal />
      <DeleteForumEntityModal />
    </ForumProviders>
  );
};

export default GroupForums;
