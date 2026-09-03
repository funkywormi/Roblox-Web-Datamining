import { useQuery } from '@tanstack/react-query';
import groupExperiencesService from '../../groupExperiences/services/groupExperiencesService';
import { GroupExperience } from '../../groupExperiences/types';

type UseLinkedUniversesResult = {
  universes: GroupExperience[];
  isLoading: boolean;
  hasLinkedUniverse: boolean;
};

// Games endpoint page-size cap (allowed: 10/25/50/100).
const LINKED_UNIVERSES_PAGE_SIZE = 100;

export default function useLinkedUniverses(
  groupId: number,
  enabled: boolean
): UseLinkedUniversesResult {
  // Use isInitialLoading, not isLoading: in react-query v4 isLoading stays true for *disabled*
  // queries (no data yet), which would keep the composer's loading state stuck while gated off.
  const { data, isInitialLoading } = useQuery({
    queryKey: ['groupLinkedUniverses', groupId],
    // A group links at most 100 universes, which is a single page at the max page size
    queryFn: async () => {
      const response = await groupExperiencesService.getGroupExperiences(groupId, {
        limit: LINKED_UNIVERSES_PAGE_SIZE
      });
      return response.data;
    },
    enabled: enabled && groupId > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  const universes = data ?? [];

  return {
    universes,
    isLoading: isInitialLoading,
    hasLinkedUniverse: universes.length > 0
  };
}
