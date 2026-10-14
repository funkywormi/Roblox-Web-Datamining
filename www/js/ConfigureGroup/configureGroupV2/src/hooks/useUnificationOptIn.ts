import { useCallback, useMemo, useState } from 'react';
import {
  useAcknowledgeGroupUnification,
  useGetGroupUnifiedAcknowledgements,
} from '../queries/creatorSettingsQueries';
import { useGetGroupCreated } from '../queries/groupMembersQueries';
import { ModalState, UNIFIED_BY_DEFAULT_CREATED_AFTER } from '../utils/unificationUtils';

export type UseUnificationOptInOptions = {
  groupId: number;
  userId: number;
};

export type UseUnificationOptInResult = {
  modalState: ModalState;
  isLoading: boolean;
  onAcknowledge: () => void;
};

export function useUnificationOptIn({
  groupId,
  userId,
}: UseUnificationOptInOptions): UseUnificationOptInResult {
  const [acknowledgedGroupIdsState, setAcknowledgedGroupIdsState] = useState<number[]>([]);
  const { mutate: acknowledgeGroupUnification } = useAcknowledgeGroupUnification();

  const { data: created, isLoading: isCreatedLoading } = useGetGroupCreated(groupId);
  const isUnifiedByMigration =
    created != null && created.getTime() < UNIFIED_BY_DEFAULT_CREATED_AFTER.getTime();

  const {
    data: acknowledgedGroupIds,
    isLoading: isAcknowledgementsLoading,
    isError: isAcknowledgementsError,
  } = useGetGroupUnifiedAcknowledgements(userId, {
    enabled: isUnifiedByMigration,
  });

  const modalState = useMemo<ModalState>(() => {
    if (!isUnifiedByMigration || isAcknowledgementsLoading || isAcknowledgementsError) {
      return ModalState.None;
    }

    return acknowledgedGroupIds?.includes(groupId) || acknowledgedGroupIdsState.includes(groupId)
      ? ModalState.None
      : ModalState.Migrated;
  }, [
    isUnifiedByMigration,
    isAcknowledgementsLoading,
    isAcknowledgementsError,
    acknowledgedGroupIds,
    acknowledgedGroupIdsState,
    groupId,
  ]);

  const onAcknowledge = useCallback(() => {
    const updatedGroupIds = [...(acknowledgedGroupIds ?? []), groupId];
    setAcknowledgedGroupIdsState((currentGroupIds) => [...currentGroupIds, groupId]);
    acknowledgeGroupUnification({
      userId,
      groupIds: updatedGroupIds,
    });
  }, [acknowledgeGroupUnification, acknowledgedGroupIds, groupId, userId]);

  return {
    modalState,
    isLoading: isCreatedLoading || (isUnifiedByMigration && isAcknowledgementsLoading),
    onAcknowledge,
  };
}
