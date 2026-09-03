import type { FunctionComponent } from 'react';
import React, { useCallback, useState } from 'react';
import creatorsDark from '@rbx/foundation-images/pictograms/two_people_dark.svg';
import creatorsLight from '@rbx/foundation-images/pictograms/two_people_light.svg';
import { NavigateBeforeIcon, Button, Grid } from '@rbx/ui';
import EmptyState from '../../components/EmptyState';
import RoleIcon from '../../members/components/common/RoleIcon';
import { DefaultMemberRoleIdNumber } from '../../utils/constants';
import { CreatorGroupList } from '../components/CreatorGroupList';
import { PermissionGroupList } from '../components/PermissionGroupList';
import {
  PermissionsTranslationProvider,
  usePermissionsTranslation,
} from '../providers/TranslationProvider';
import { PermissionsUIConfigProvider, usePermissionsUiConfig } from '../providers/UIConfigProvider';
import type { CreatorDetails, EntityDetails, PermissionsUIConfig } from '../utils/types';
import { CreatorTypes } from '../utils/types';

export type PermissionsContainerProps = {
  entity: EntityDetails;
  creatorFilter: Array<CreatorTypes | CreatorDetails>;
  uiConfig?: PermissionsUIConfig;
};

type PermissionsContainerInternalProps = Omit<PermissionsContainerProps, 'uiConfig'> & {
  setSelectedCreator: React.Dispatch<React.SetStateAction<CreatorDetails | null | undefined>>;
  selectedCreator?: CreatorDetails | null;
};

const ROLE_CREATOR_TYPES = new Set([
  CreatorTypes.MEMBER_ROLE,
  CreatorTypes.GUEST_ROLE,
  CreatorTypes.LEGACY_ROLE,
  CreatorTypes.ROLE,
]);

const renderCreatorHeaderLabel = (creator: CreatorDetails) => (
  <span className='inline-flex items-center gap-small'>
    {ROLE_CREATOR_TYPES.has(creator.type) && (
      <RoleIcon
        roleId={
          creator.type === CreatorTypes.MEMBER_ROLE ? DefaultMemberRoleIdNumber : Number(creator.id)
        }
        color={creator.color}
        isPrivate={creator.isPrivate}
        size='Small'
      />
    )}
    {creator.name}
  </span>
);

const DefaultEmptyState: FunctionComponent<{ creatorType?: CreatorTypes }> = ({ creatorType }) => {
  const { translate } = usePermissionsTranslation();
  const titleKey = creatorType
    ? `Universe.Messages.${creatorType}.NoCreatorsToShow`
    : 'Messages.NoCreators';

  return (
    <EmptyState
      illustration={{ light: creatorsLight, dark: creatorsDark }}
      title={translate(titleKey)}
    />
  );
};

const PermissionsContainerInternal: FunctionComponent<PermissionsContainerInternalProps> = ({
  entity,
  creatorFilter,
  setSelectedCreator,
  selectedCreator,
}) => {
  const { translate } = usePermissionsTranslation();
  const { showMobileView, singleCreatorExperience } = usePermissionsUiConfig();
  const [mobileStep, setMobileStep] = useState<number>(1);

  const onCreatorSelect = useCallback(
    (creator: CreatorDetails | null) => {
      setSelectedCreator(creator);
      setMobileStep(2);
    },
    [setSelectedCreator, setMobileStep],
  );

  if (selectedCreator === null) {
    const creatorType = entity.owner?.type;
    return <DefaultEmptyState creatorType={creatorType} />;
  }

  return (
    <Grid container className='width-full' data-testid='permissions-container' alignItems='stretch'>
      <Grid container className='flex-col medium:flex-row medium:gap-medium'>
        {!singleCreatorExperience && (
          <Grid
            item
            className='max-medium:width-full medium:grow-1 medium:shrink-1 medium:basis-0 medium:min-width-0 medium:max-width-[216px]'
            hidden={showMobileView && mobileStep !== 1}
            data-testid='creator-group-list'>
            <CreatorGroupList
              entity={entity}
              creatorFilter={creatorFilter}
              selectedCreator={selectedCreator ?? undefined}
              onCreatorSelect={onCreatorSelect}
            />
          </Grid>
        )}
        <Grid
          item
          hidden={showMobileView && mobileStep !== 2}
          className={`max-medium:width-full medium:grow-2 medium:shrink-1 medium:basis-0 medium:min-width-0 ${
            showMobileView ? 'absolute [top:0] [left:0] [right:0] bg-surface-0 [z-index:1]' : ''
          }`}>
          {showMobileView && (
            <Button
              startIcon={<NavigateBeforeIcon />}
              onClick={() => setMobileStep(1)}
              color='primary'
              className='padding-y-small padding-x-xsmall'
              data-testid='mobile-back-button'>
              {selectedCreator
                ? renderCreatorHeaderLabel(selectedCreator)
                : translate('Action.MobileBackButton')}
            </Button>
          )}
          <PermissionGroupList
            entity={entity}
            creator={selectedCreator}
            key={selectedCreator?.id}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

const PermissionsContainer: FunctionComponent<PermissionsContainerProps> = ({
  entity,
  creatorFilter,
  uiConfig,
}) => {
  const [userSelectedCreator, setUserSelectedCreator] = useState<
    CreatorDetails | null | undefined
  >();

  // In single-creator mode the creator list is hidden, so the sole creator is always
  // selected — derive it during render instead of syncing state via an effect.
  const firstCreator = creatorFilter[0];
  const selectedCreator =
    uiConfig?.singleCreatorExperience && firstCreator && typeof firstCreator !== 'string'
      ? firstCreator
      : userSelectedCreator;

  return (
    <PermissionsTranslationProvider entity={entity} selectedCreator={selectedCreator ?? undefined}>
      <PermissionsUIConfigProvider {...uiConfig}>
        <PermissionsContainerInternal
          entity={entity}
          creatorFilter={creatorFilter}
          setSelectedCreator={setUserSelectedCreator}
          selectedCreator={selectedCreator}
        />
      </PermissionsUIConfigProvider>
    </PermissionsTranslationProvider>
  );
};

export { PermissionsContainer };
