import { useCallback, useState } from 'react';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import GroupMetadata from '../entities/group.json';
import UniverseMetadata from '../entities/universe.json';
import { usePermissionsTranslation } from '../providers/TranslationProvider';
import { useGetAllPermissions, useUpdateAllPermissions } from '../queries/permissionsQueries';
import type {
  CreatorDetails,
  EntityDetails,
  EntityPermissionsMetadata,
  PermissionRequest,
  PermissionResponse,
} from '../utils/types';
import { EntityTypes } from '../utils/types';

const EntityConfig = {
  [EntityTypes.UNIVERSE]: { metadata: UniverseMetadata as EntityPermissionsMetadata },
  [EntityTypes.GROUP]: { metadata: GroupMetadata as EntityPermissionsMetadata },
};

export type UsePermissionsResult = {
  metadata?: EntityPermissionsMetadata;
  isPending: boolean;
  isError: boolean;
  isSaving: boolean;
  permissionData?: Record<string, PermissionResponse> | null;
  savePermissions: (permissionsData: Record<string, PermissionRequest>) => void;
  refetch: () => void;
};

export default function usePermissions(
  creator?: CreatorDetails,
  entity?: EntityDetails,
): UsePermissionsResult {
  const { metadata } = entity ? EntityConfig[entity.type] : {};
  const { organization } = useCurrentGroup();
  const {
    data: permissionsData,
    isError,
    isPending,
    isFetching,
    refetch,
  } = useGetAllPermissions(creator, entity, organization ?? undefined);
  const { mutate, isPending: isMutationPending } = useUpdateAllPermissions();
  const { translate, displayMessage } = usePermissionsTranslation();

  const [isPostSaveFetch, setIsPostSaveFetch] = useState(false);
  const [prevIsFetching, setPrevIsFetching] = useState(isFetching);
  if (prevIsFetching !== isFetching) {
    setPrevIsFetching(isFetching);
    if (!isFetching && isPostSaveFetch) {
      setIsPostSaveFetch(false);
    }
  }

  const savePermissions = useCallback(
    (updatedPermissions: Record<string, PermissionRequest>) => {
      const changedPermissions =
        permissionsData != null
          ? Object.fromEntries(
              Object.entries(updatedPermissions).filter(
                ([key, { isGranted }]) =>
                  key in permissionsData && permissionsData[key].isGranted !== isGranted,
              ),
            )
          : updatedPermissions;
      mutate(
        {
          creator,
          entity,
          organization: organization ?? undefined,
          updatedPermissions: changedPermissions,
        },
        {
          onSuccess: () => {
            setIsPostSaveFetch(true);
            displayMessage(translate('Messages.PermissionsSaved'));
          },
          onError: () => {
            displayMessage(translate('Messages.ErrorSavingPermissions'), true);
          },
        },
      );
    },
    [creator, entity, organization, mutate, permissionsData, translate, displayMessage],
  );

  return {
    metadata,
    isPending,
    isError,
    isSaving: isMutationPending || isPostSaveFetch,
    permissionData: permissionsData,
    savePermissions,
    refetch,
  };
}
