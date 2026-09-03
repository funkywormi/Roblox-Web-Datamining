import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import creatorSettingsClient from '../clients/creatorSettings';

const GROUP_UNIFIED_ACKNOWLEDGEMENTS_QUERY_KEY = 'groupUnifiedAcknowledgements';

function parseGroupIds(settingValue: string | undefined): number[] {
  if (!settingValue) {
    return [];
  }

  const parsedValue: unknown = JSON.parse(settingValue);
  if (!Array.isArray(parsedValue)) {
    throw new TypeError('Invalid group unified acknowledgement setting');
  }

  const groupIds: number[] = [];
  for (const groupId of parsedValue) {
    if (typeof groupId !== 'number' || !Number.isSafeInteger(groupId)) {
      throw new TypeError('Invalid group unified acknowledgement setting');
    }
    groupIds.push(groupId);
  }

  return groupIds;
}

export function useGetGroupUnifiedAcknowledgements(
  userId: number | undefined,
  options: { enabled: boolean },
) {
  return useQuery({
    enabled: userId !== undefined && options.enabled,
    queryKey: [GROUP_UNIFIED_ACKNOWLEDGEMENTS_QUERY_KEY, userId],
    queryFn: async () => {
      if (userId === undefined) {
        throw new Error('userId required');
      }

      const { settingValue } = await creatorSettingsClient.getGroupUnifiedAcknowledgements(userId);
      return parseGroupIds(settingValue);
    },
  });
}

type AcknowledgeGroupOptions = {
  userId: number;
  groupIds: number[];
};

export function useAcknowledgeGroupUnification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, groupIds }: AcknowledgeGroupOptions) =>
      creatorSettingsClient.updateGroupUnifiedAcknowledgements(userId, groupIds),
    onSuccess: (_data, { userId, groupIds }) => {
      queryClient.setQueryData([GROUP_UNIFIED_ACKNOWLEDGEMENTS_QUERY_KEY, userId], groupIds);
    },
  });
}
