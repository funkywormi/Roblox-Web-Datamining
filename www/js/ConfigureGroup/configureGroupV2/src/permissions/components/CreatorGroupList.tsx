import type { FunctionComponent } from 'react';
import React, { useEffect, useMemo } from 'react';
import { Chip } from '@rbx/foundation-ui';
import { Grid, Alert, CircularProgress } from '@rbx/ui';
import { useEarlyTesterRoleAccess } from '../../earlyTesters/hooks/useEarlyTesterRoleAccess';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import { usePermissionsTranslation } from '../providers/TranslationProvider';
import { usePermissionsUiConfig } from '../providers/UIConfigProvider';
import { useGetAllCreators } from '../queries';
import findFirstCreator from '../utils/creator';
import type { CreatorDetails, CreatorFilter, EntityDetails } from '../utils/types';
import { CreatorTypes, CreatorFilterChipTypes, EntityTypes } from '../utils/types';
import { Creator } from './Creator';
import { CreatorsGroup } from './CreatorGroup';

export type CreatorGroupListProps = {
  creatorFilter: CreatorFilter;
  selectedCreator?: CreatorDetails;
  entity: EntityDetails;
  onCreatorSelect: (creator: CreatorDetails | null) => void;
  showEarlyTestersChip?: boolean;
  selectedChip: CreatorFilterChipTypes;
};

type CreatorChip = {
  labelKey: CreatorFilterChipTypes;
  creatorTypes: Set<CreatorTypes>;
};

const ALL_CREATOR_CHIPS: CreatorChip[] = [
  {
    labelKey: CreatorFilterChipTypes.ROLE,
    creatorTypes: new Set([CreatorTypes.MEMBER_ROLE, CreatorTypes.LEGACY_ROLE, CreatorTypes.ROLE]),
  },
  {
    labelKey: CreatorFilterChipTypes.EARLY_TESTERS,
    creatorTypes: new Set(),
  },
  {
    labelKey: CreatorFilterChipTypes.USER,
    creatorTypes: new Set([CreatorTypes.USER]),
  },
];

const CHIP_LABEL_KEYS: Record<CreatorFilterChipTypes, string> = {
  [CreatorFilterChipTypes.ALL]: 'Chip.All.Label',
  [CreatorFilterChipTypes.ROLE]: 'Chip.Role.Label',
  [CreatorFilterChipTypes.EARLY_TESTERS]: 'Permissions.FilterPill.EarlyTesters.Label',
  [CreatorFilterChipTypes.USER]: 'Permissions.FilterPill.ExternalPlaytesters.Label',
};

const CREATOR_LIST_CHIP_TYPES = new Set([CreatorFilterChipTypes.ROLE, CreatorFilterChipTypes.USER]);

const getVisibleCreatorChips = (
  creatorData: ReturnType<typeof useGetAllCreators>['data'],
  includeEarlyTestersChip: boolean,
): CreatorChip[] =>
  ALL_CREATOR_CHIPS.filter((chip) => {
    if (chip.labelKey === CreatorFilterChipTypes.EARLY_TESTERS) {
      return includeEarlyTestersChip;
    }
    return creatorData?.some((creatorGroup) => chip.creatorTypes.has(creatorGroup.type));
  });

const useCreatorListQuery = (creatorFilter: CreatorFilter, entity: EntityDetails) => {
  const { isOwner, organization, rolePermissions } = useCurrentGroup();
  const query = useGetAllCreators(
    creatorFilter,
    entity,
    organization ?? undefined,
    rolePermissions ?? undefined,
    isOwner,
  );
  return query;
};

export type CreatorFilterChipRowProps = {
  creatorFilter: CreatorFilter;
  entity: EntityDetails;
  showEarlyTestersChip?: boolean;
  selectedChip: CreatorFilterChipTypes;
  onSelectedChipChange: (chip: CreatorFilterChipTypes) => void;
};

export const CreatorFilterChipRow: FunctionComponent<CreatorFilterChipRowProps> = ({
  creatorFilter,
  entity,
  showEarlyTestersChip = false,
  selectedChip,
  onSelectedChipChange,
}) => {
  const { translate } = usePermissionsTranslation();
  const { data: creatorData, isPending, isError } = useCreatorListQuery(creatorFilter, entity);
  const { canView: canViewEarlyTesters } = useEarlyTesterRoleAccess(
    entity.id,
    showEarlyTestersChip && entity.type === EntityTypes.UNIVERSE,
  );
  const includeEarlyTestersChip = showEarlyTestersChip && canViewEarlyTesters;
  const creatorChips = useMemo(
    () => getVisibleCreatorChips(creatorData, includeEarlyTestersChip),
    [creatorData, includeEarlyTestersChip],
  );
  const activeChip = creatorChips.find((chip) => chip.labelKey === selectedChip) ?? creatorChips[0];

  if (isPending || isError || creatorChips.length <= 1) {
    return null;
  }

  return (
    <div className='gap-small flex flex-row wrap width-full'>
      {creatorChips.map((chip) => {
        const translated = translate(CHIP_LABEL_KEYS[chip.labelKey]);
        const label = typeof translated === 'string' ? translated : '';
        return (
          <Chip
            key={chip.labelKey}
            isChecked={activeChip === chip}
            text={label}
            onCheckedChange={() => onSelectedChipChange(chip.labelKey)}
            size='Medium'
            variant='Standard'
            data-testid={`chip-${chip.labelKey}`}
          />
        );
      })}
    </div>
  );
};

const CreatorGroupList: FunctionComponent<CreatorGroupListProps> = ({
  creatorFilter,
  entity,
  selectedCreator,
  onCreatorSelect,
  showEarlyTestersChip = false,
  selectedChip,
}) => {
  const { showMobileView } = usePermissionsUiConfig();
  const { translate } = usePermissionsTranslation();
  const { data: creatorData, isPending, isError } = useCreatorListQuery(creatorFilter, entity);
  const { canView: canViewEarlyTesters } = useEarlyTesterRoleAccess(
    entity.id,
    showEarlyTestersChip && entity.type === EntityTypes.UNIVERSE,
  );
  const includeEarlyTestersChip = showEarlyTestersChip && canViewEarlyTesters;
  const creatorChips = useMemo(
    () => getVisibleCreatorChips(creatorData, includeEarlyTestersChip),
    [creatorData, includeEarlyTestersChip],
  );
  const activeChip = creatorChips.find((chip) => chip.labelKey === selectedChip) ?? creatorChips[0];
  const showCreatorsGroup = activeChip != null && CREATOR_LIST_CHIP_TYPES.has(activeChip.labelKey);
  const earlyTestersIsAvailable = creatorChips.some(
    (chip) => chip.labelKey === CreatorFilterChipTypes.EARLY_TESTERS,
  );

  useEffect(() => {
    if (isPending || isError || showMobileView) {
      return;
    }
    if (!showCreatorsGroup || !activeChip) {
      if (!earlyTestersIsAvailable && selectedCreator !== null) {
        onCreatorSelect(null);
      }
      return;
    }
    const selectionBelongsToChip =
      selectedCreator != null && activeChip.creatorTypes.has(selectedCreator.type);
    if (selectionBelongsToChip) {
      return;
    }
    onCreatorSelect(
      findFirstCreator(
        creatorData?.filter((creatorGroup) => activeChip.creatorTypes.has(creatorGroup.type)),
      ),
    );
  }, [
    activeChip,
    creatorData,
    earlyTestersIsAvailable,
    isError,
    isPending,
    onCreatorSelect,
    selectedCreator,
    showCreatorsGroup,
    showMobileView,
  ]);

  if (isError) {
    return (
      <Grid margin={3}>
        <Alert severity='error' variant='standard'>
          {translate('Messages.CreatorFetchFailed')}
        </Alert>
      </Grid>
    );
  }

  if (isPending) {
    return (
      <Grid container justifyContent='center' mt={10}>
        <CircularProgress />
      </Grid>
    );
  }

  if (!showCreatorsGroup) {
    return null;
  }

  return (
    <Grid>
      {entity.owner && <Creator {...entity.owner} isOwner />}
      {creatorData?.map(
        (creatorGroup) =>
          activeChip.creatorTypes.has(creatorGroup.type) && (
            <CreatorsGroup
              key={creatorGroup.type}
              selectedCreator={selectedCreator}
              {...creatorGroup}
              onCreatorSelect={onCreatorSelect}
            />
          ),
      )}
    </Grid>
  );
};

export { CreatorGroupList };
