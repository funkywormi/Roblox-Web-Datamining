import { useCallback, useMemo, useState } from 'react';
import {
  useAcknowledgeGroupUnification,
  useGetGroupUnifiedAcknowledgements,
} from '../queries/creatorSettingsQueries';
import {
  useGetMigrationBreakingChanges,
  useGetMigrationStatus,
  useMigrateGroup,
} from '../queries/migrationQueries';
import type { BreakingChangeEntry } from '../utils/unificationUtils';
import {
  MIGRATION_STATUS,
  ModalState,
  isSnoozed,
  isUnificationModalSuppressed,
  snooze,
} from '../utils/unificationUtils';

export type UseUnificationOptInOptions = {
  groupId: number;
  userId: number;
};

export type UseUnificationOptInResult = {
  modalState: ModalState;
  breakingChanges: BreakingChangeEntry[];
  isLoading: boolean;
  onContinue: () => void;
  onAskLater: () => void;
  onAcknowledge: () => void;
};

export function useUnificationOptIn({
  groupId,
  userId,
}: UseUnificationOptInOptions): UseUnificationOptInResult {
  const [isSnoozedState, setIsSnoozedState] = useState(() => isSnoozed(groupId));
  const [hasContinued, setHasContinued] = useState(false);
  const [acknowledgedGroupIdsState, setAcknowledgedGroupIdsState] = useState<number[]>([]);
  const isModalSuppressed = isUnificationModalSuppressed();
  const { mutate: migrateGroup } = useMigrateGroup();
  const { mutate: acknowledgeGroupUnification } = useAcknowledgeGroupUnification();

  const { data: migrationStatus, isLoading: isStatusLoading } = useGetMigrationStatus(groupId);

  const status = migrationStatus?.status;
  const isNotMigrated = status === MIGRATION_STATUS.NOT_MIGRATED;
  const isMigrated = status === MIGRATION_STATUS.MIGRATED;

  const {
    data: acknowledgedGroupIds,
    isLoading: isAcknowledgementsLoading,
    isError: isAcknowledgementsError,
  } = useGetGroupUnifiedAcknowledgements(userId, {
    enabled: isMigrated,
  });

  const {
    data: breakingChangesData,
    isLoading: isBreakingChangesLoading,
    isError: isBreakingChangesError,
  } = useGetMigrationBreakingChanges(groupId, {
    enabled: isNotMigrated && !isSnoozedState && !isModalSuppressed,
  });

  const breakingChanges = useMemo(
    () => breakingChangesData?.breakingChanges ?? [],
    [breakingChangesData?.breakingChanges],
  );

  const modalState = useMemo<ModalState>(() => {
    if (isModalSuppressed) {
      return ModalState.None;
    }

    if (!status || status === MIGRATION_STATUS.MIGRATING) {
      return ModalState.None;
    }

    if (isMigrated) {
      if (isAcknowledgementsLoading || isAcknowledgementsError) {
        return ModalState.None;
      }

      return acknowledgedGroupIds?.includes(groupId) || acknowledgedGroupIdsState.includes(groupId)
        ? ModalState.None
        : ModalState.Migrated;
    }

    if (isNotMigrated) {
      if (isBreakingChangesLoading || isBreakingChangesError || isSnoozedState || hasContinued) {
        return ModalState.None;
      }
      return breakingChanges.length > 0 ? ModalState.Breaking : ModalState.NonBreaking;
    }

    return ModalState.None;
  }, [
    status,
    isModalSuppressed,
    isMigrated,
    isAcknowledgementsLoading,
    isAcknowledgementsError,
    acknowledgedGroupIds,
    acknowledgedGroupIdsState,
    groupId,
    isNotMigrated,
    isSnoozedState,
    hasContinued,
    isBreakingChangesLoading,
    isBreakingChangesError,
    breakingChanges.length,
  ]);

  const onContinue = useCallback(() => {
    migrateGroup(groupId);
    setHasContinued(true);
  }, [migrateGroup, groupId]);

  const onAskLater = useCallback(() => {
    snooze(groupId);
    setIsSnoozedState(true);
  }, [groupId]);

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
    breakingChanges,
    isLoading:
      isStatusLoading || isBreakingChangesLoading || (isMigrated && isAcknowledgementsLoading),
    onContinue,
    onAskLater,
    onAcknowledge,
  };
}
