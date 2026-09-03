import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGroupsForUserAsync, Group } from "../services/groupsService";

type FetchGroupsDataResponse = {
  groups: Group[];
  isLoading: boolean;
};

const useFetchGroupsData = (profileId: string, groupIds: number[]): FetchGroupsDataResponse => {
  const { data, isLoading } = useQuery({
    queryKey: ["fetchGroupsData", profileId, groupIds],
    queryFn: async () => {
      if (!profileId || groupIds.length === 0) {
        return [];
      }

      const rolesResponse = await fetchGroupsForUserAsync(profileId);
      const groupsMap = new Map<number, Group>();

      const profileIdNum = Number(profileId);
      for (const groupData of rolesResponse) {
        groupsMap.set(groupData.group.id, {
          ...groupData.group,
          role: groupData.role,
          isOwner: groupData.group.owner?.userId === profileIdNum,
        });
      }

      return groupIds
        .map(groupId => groupsMap.get(groupId))
        .filter((group): group is Group => group !== undefined);
    },
  });

  return useMemo(
    () => ({
      groups: data ?? [],
      isLoading,
    }),
    [data, isLoading],
  );
};

export default useFetchGroupsData;
