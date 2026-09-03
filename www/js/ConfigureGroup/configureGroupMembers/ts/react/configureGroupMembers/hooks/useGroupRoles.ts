import { useQuery } from '@tanstack/react-query';
import { Group, Role } from '../../shared/types';
import groupsService from '../../shared/services/groupsService';

interface UseGroupRolesParams {
  group: Group;
  includePrivate?: boolean;
}

interface UseGroupRolesResult {
  roles: Array<Role>;
  isLoading: boolean;
  isError: boolean;
}
const useGroupRoles = ({ group, includePrivate }: UseGroupRolesParams): UseGroupRolesResult => {
  const queryKey = ['group-roles', group.id, includePrivate];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const fetchedRoles = await groupsService.getGroupRoles({
        groupId: group.id,
        includePrivate
      });
      // The backend returns roles in ascending LexoRank order.
      return fetchedRoles.filter(role => role.rank > 0 && !role.isBase);
    }
  });

  return {
    roles: data ?? [],
    isLoading,
    isError
  };
};

export default useGroupRoles;
