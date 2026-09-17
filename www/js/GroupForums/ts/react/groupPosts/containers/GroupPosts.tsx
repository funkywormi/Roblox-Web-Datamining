import React from 'react';
import { Group, GroupPermissions, GroupChannelPermissions } from '../../shared/types';
import { GroupDetailsPolicies } from '../../groupShouts/types';
import PostsProviders from './PostsProviders';
import GroupPostsContent from './GroupPostsContent';

export type GroupPostsProps = {
  group: Group;
  permissions: GroupPermissions;
  channelsPermissions: GroupChannelPermissions[];
  userId: number;
  isGroupMember: boolean;
  forumsEnabled: boolean;
  policies: GroupDetailsPolicies;
};

const GroupPosts = (props: GroupPostsProps): JSX.Element | null => {
  const { group, permissions, userId } = props;

  if (!group?.id) return null;

  const isOwner = group.owner?.userId === userId;

  return (
    <PostsProviders permissions={permissions} groupId={group.id} isOwner={isOwner}>
      <GroupPostsContent {...props} isOwner={isOwner} />
    </PostsProviders>
  );
};

export default GroupPosts;
