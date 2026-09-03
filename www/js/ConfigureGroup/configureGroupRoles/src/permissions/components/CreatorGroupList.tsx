import type { FunctionComponent } from 'react';
import React, { useEffect, useState } from 'react';
import { Chip } from '@rbx/foundation-ui';
import { Grid, Alert, CircularProgress } from '@rbx/ui';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import { usePermissionsTranslation } from '../providers/TranslationProvider';
import { usePermissionsUiConfig } from '../providers/UIConfigProvider';
import { useGetAllCreators } from '../queries';
import findFirstCreator from '../utils/creator';
import type { CreatorDetails, CreatorFilter, EntityDetails } from '../utils/types';
import { CreatorTypes, CreatorFilterChipTypes } from '../utils/types';
import { Creator } from './Creator';
import { CreatorsGroup } from './CreatorGroup';

export type CreatorGroupListProps = {
  creatorFilter: CreatorFilter;
  selectedCreator?: CreatorDetails;
  entity: EntityDetails;
  onCreatorSelect: (creator: CreatorDetails | null) => void;
};

const ALL_CHIPS: { labelKey: CreatorFilterChipTypes; creatorTypes: Set<CreatorTypes> }[] = [
  {
    labelKey: CreatorFilterChipTypes.ALL,
    creatorTypes: new Set([
      CreatorTypes.MEMBER_ROLE,
      CreatorTypes.USER,
      CreatorTypes.LEGACY_ROLE,
      CreatorTypes.ROLE,
    ]),
  },
  {
    labelKey: CreatorFilterChipTypes.USER,
    creatorTypes: new Set([CreatorTypes.USER]),
  },
  {
    labelKey: CreatorFilterChipTypes.ROLE,
    creatorTypes: new Set([CreatorTypes.MEMBER_ROLE, CreatorTypes.LEGACY_ROLE, CreatorTypes.ROLE]),
  },
];

const CreatorGroupList: FunctionComponent<CreatorGroupListProps> = ({
  creatorFilter,
  entity,
  selectedCreator,
  onCreatorSelect,
}) => {
  const { showMobileView } = usePermissionsUiConfig();
  const { translate } = usePermissionsTranslation();
  const { isOwner, organization, rolePermissions } = useCurrentGroup();
  const {
    data: creatorData,
    isPending,
    isError,
  } = useGetAllCreators(
    creatorFilter,
    entity,
    organization ?? undefined,
    rolePermissions ?? undefined,
    isOwner,
  );
  const [selectedChip, setSelectedChip] = useState<number>(0);

  const chipsToShow = ALL_CHIPS.filter((chip) =>
    creatorData?.some((creatorGroup) => chip.creatorTypes.has(creatorGroup.type)),
  );

  useEffect(() => {
    if (!selectedCreator && !isPending && !showMobileView) {
      const firstCreator = findFirstCreator(creatorData);
      onCreatorSelect(firstCreator);
    }
  }, [showMobileView, isPending, creatorData, onCreatorSelect, selectedCreator]);

  if (isError) {
    return (
      <Grid margin={3}>
        <Alert severity='error' variant='standard'>
          {translate('Messages.CreatorFetchFailed')}
        </Alert>
      </Grid>
    );
  }

  return isPending ? (
    <Grid container justifyContent='center' mt={10}>
      <CircularProgress />
    </Grid>
  ) : (
    <>
      {/* the first chip is the "all" chip. If there are only 2 chips, both will show the same data. */}
      {chipsToShow.length > 2 && (
        <Grid container justifyContent='left' mb={3}>
          {chipsToShow.map((chip, index) => {
            const label = translate(`Chip.${chip.labelKey}.Label`);
            return (
              <Grid pr={1} key={chip.labelKey}>
                <Chip
                  isChecked={selectedChip === index}
                  text={typeof label === 'string' ? label : ''}
                  onCheckedChange={() => setSelectedChip(index)}
                  size='Medium'
                  variant='Standard'
                  data-testid={`chip-${chip.labelKey}`}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
      <Grid>
        {entity.owner && <Creator {...entity.owner} isOwner />}
        {creatorData &&
          creatorData.map(
            (creatorGroup) =>
              chipsToShow[selectedChip].creatorTypes.has(creatorGroup.type) && (
                <CreatorsGroup
                  key={creatorGroup.type}
                  selectedCreator={selectedCreator}
                  {...creatorGroup}
                  onCreatorSelect={onCreatorSelect}
                />
              ),
          )}
      </Grid>
    </>
  );
};

export { CreatorGroupList };
