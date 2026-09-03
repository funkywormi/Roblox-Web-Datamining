import { EnvironmentUrls } from 'Roblox';

const { groupsApi } = EnvironmentUrls;

const urls = {
  userGroupBan: (groupId: number, userId: number): string =>
    `${groupsApi}/v1/groups/${groupId}/bans/${userId}`,
  deleteForumPostsByUser: (groupId: number, userId: number): string =>
    `${groupsApi}/v1/groups/${groupId}/forums/${userId}/posts`
};

const noOpFunctionRef = (): void => {
  /* do nothing */
};

export { urls, noOpFunctionRef };
