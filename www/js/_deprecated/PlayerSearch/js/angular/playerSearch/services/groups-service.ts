import { EnvironmentUrls } from 'Roblox';
import { httpService, urlService } from 'core-utilities';
import { PrimaryGroup } from '../types/primary-group';

// The response body format from the primary group request.
type GetPrimaryGroupResponse = {
  group: {
    id: number;
    name: string;
  };
};

// The response for multi-getting primary groups.
type MultiGetPrimaryGroupItem = {
  userId: number;
  primaryGroup: PrimaryGroup | undefined;
};

const getUserPrimaryGroup = async (userId: number): Promise<PrimaryGroup | undefined> => {
  const response = await httpService.get<GetPrimaryGroupResponse>({
    retryable: true,
    withCredentials: true,
    url: `${EnvironmentUrls.groupsApi}/v1/users/${userId}/groups/primary/role`
  });

  const { group } = response.data;
  if (!group) {
    return undefined;
  }

  return {
    id: group.id,
    name: group.name,
    url: urlService.getAbsoluteUrl(`/groups/${group.id}`)
  };
};

const multiGetUserPrimaryGroups = async (
  userIds: number[]
): Promise<MultiGetPrimaryGroupItem[]> => {
  if (userIds.length < 1) {
    // If there's nothing to fetch, do nothing.
    return [];
  }

  const groups: MultiGetPrimaryGroupItem[] = [];
  await Promise.all(
    userIds.map(async (userId, i) => {
      try {
        // Maintain the user ID index, to make sure the mapping is correct.
        groups[i] = {
          userId,
          primaryGroup: await getUserPrimaryGroup(userId)
        };
      } catch {
        // If the primary group fails to load, assume they don't have one, to ensure
        // the page doesn't fail to load just because of groups.
        groups[i] = {
          userId,
          primaryGroup: undefined
        };
      }
    })
  );

  return groups;
};

export default { multiGetUserPrimaryGroups };
