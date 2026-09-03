import React, { useEffect, useMemo, useState } from 'react';
import {
  TextInput,
  TextArea,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogContent,
  Icon
} from '@rbx/foundation-ui';
import { useSystemFeedback } from 'react-style-guide';
import { useTheme, useTranslation } from 'react-utilities';
import { Role, RoleColorValues, RoleColors } from '../../shared/types';
import groupRolesService from '../services/groupRolesService';
import { useConfigurationMetadata } from '../../shared/contexts/ConfigurationMetadataContext';
import {
  colorIntToColorTokenMap,
  pickableRoleColorsList
} from '../../shared/constants/groupRoleColorConstants';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import { isLockedOwnerRole, getMaxAssignableRank } from '../../shared/utils/communityOwnership';

const invalidRoleColorSlashIconClassName = (isSelected: boolean, theme: string): string => {
  if (isSelected) {
    return theme === 'dark' ? 'content-action-sub-emphasis' : 'content-emphasis';
  }

  return theme === 'dark' ? 'content-emphasis' : 'content-action-sub-emphasis';
};

/** Maps picker swatch + current selection to light/dark token names for --color-dot-* (re-runs when `selectedColor` changes). */
const getColorDotCustomPropertyTokens = (
  roleColor: RoleColors,
  selectedColor: RoleColors,
  tokens: { Light: string; Dark: string }
): { light: string; dark: string } => {
  if (roleColor !== RoleColorValues.Invalid) {
    return { light: tokens.Light, dark: tokens.Dark };
  }

  if (selectedColor === roleColor) {
    return { light: tokens.Light, dark: tokens.Dark };
  }
  return { light: tokens.Dark, dark: tokens.Light };
};

interface SettingsTabProps {
  groupId: number;
  role: Role;
  isLoggedInUserOwner: boolean;
  isLowestDeletableRole?: boolean;
  isAutoAssignRoleDisabled?: boolean;
  onRoleUpdated?: (updatedRole: Role) => void;
  onRoleDeleted?: (roleId: number) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  groupId,
  role,
  isLoggedInUserOwner,
  isLowestDeletableRole,
  isAutoAssignRoleDisabled,
  onRoleUpdated,
  onRoleDeleted
}) => {
  const theme = useTheme();
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();
  const { roleConfiguration } = useConfigurationMetadata();
  const { nameMaxLength, descriptionMaxLength, minRank, maxRank } = roleConfiguration;
  const { isLoading: isLoadingGuac, data: configureGroupUi } = useGuacConfig('configure-group-ui');
  const { features } = useCommunityProductFeatures();
  const isOwnerRolesetDeprecated = features.IsOwnerRolesetDeprecated;

  const showAutoAssignWarning =
    Boolean(configureGroupUi?.displayAutoAssignRoleDeleteWarning) &&
    Boolean(isLowestDeletableRole) &&
    isAutoAssignRoleDisabled !== true;

  const [name, setName] = useState<string>(role.name);
  const [rank, setRank] = useState<number>(role.rank);
  const [description, setDescription] = useState<string>(role.description || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const allowDeleteRoleSetWithUsers = Boolean(configureGroupUi?.allowDeleteRoleSetWithUsers);
  const isGuestRole = role.rank === minRank;
  const isOwnerRoleLocked = isLockedOwnerRole(role, maxRank, isOwnerRolesetDeprecated);
  const isBaseMemberRole = role.isBase;
  const showRoleColorPicker = Boolean(
    isLoggedInUserOwner &&
      !isBaseMemberRole &&
      role.rank > 0 &&
      !isLoadingGuac &&
      configureGroupUi?.displaySetRoleColorConfiguration
  );

  const [color, setColor] = useState<RoleColors>(() => {
    if (isBaseMemberRole) return RoleColorValues.Invalid;

    return role.color ?? RoleColorValues.Invalid;
  });

  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [role.id]);

  const rankErrorMessage = useMemo((): string | undefined => {
    if (isGuestRole || isOwnerRoleLocked) return undefined;
    if (rank === null) return 'The rank field cannot be empty';
    if (rank === undefined || Number.isNaN(rank)) return 'The value you have entered is invalid';
    // The rank just above the highest assignable rank is the "reserved high" sentinel; post-deprecation
    // it lands at `maxRank + 1` which can never match, effectively disabling the upper reservation check.
    const reservedHigh = getMaxAssignableRank(maxRank, isOwnerRolesetDeprecated) + 1;
    if (rank === minRank || rank === reservedHigh) {
      if (isOwnerRolesetDeprecated) {
        return translate('Message.RankReservedOnlyForGuest', {
          minRankPlusOne: minRank + 1,
          maxRank,
          minRank
        });
      }
      return translate('Message.RankReserved', {
        minRankPlusOne: minRank + 1,
        maxRankMinusOne: maxRank - 1,
        minRank,
        maxRank
      });
    }
    return undefined;
    // translate is stable from useTranslation(); no need to recompute when it changes
  }, [isGuestRole, isOwnerRoleLocked, isOwnerRolesetDeprecated, rank, minRank, maxRank]); // eslint-disable-line react-hooks/exhaustive-deps
  const rankHasError = rankErrorMessage !== undefined;

  const isNameFieldDisabled = !isLoggedInUserOwner || isGuestRole;
  const isDescriptionFieldDisabled = !isLoggedInUserOwner || isGuestRole;
  const isRankFieldDisabled =
    !isLoggedInUserOwner || isOwnerRoleLocked || isGuestRole || isBaseMemberRole;
  const isSaveButtonDisabled = !name.trim() || rankHasError || isGuestRole || !hasUnsavedChanges;
  const showSaveButton = isLoggedInUserOwner;
  const showDeleteRole =
    isLoggedInUserOwner && !(isOwnerRoleLocked || isGuestRole || isBaseMemberRole);
  const roleHasNoMembers = (role.memberCount ?? 0) === 0;
  const canDeleteRole = roleHasNoMembers || allowDeleteRoleSetWithUsers;

  const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setHasUnsavedChanges(true);
  };

  const onRankChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = Number(event.target.value);
    if (!Number.isNaN(numericValue)) {
      setRank(numericValue);
      setHasUnsavedChanges(true);
    }
  };

  const onDescriptionChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
    setHasUnsavedChanges(true);
  };

  const onColorSelected = (selectedColor: RoleColors) => {
    setColor(selectedColor);
    setHasUnsavedChanges(true);
  };

  const onSaveClicked = async () => {
    setIsSaving(true);
    try {
      await groupRolesService.updateGroupRole(groupId, role.id, {
        name,
        rank,
        description,
        color
      });
      systemFeedbackService.success(translate('Message.RoleUpdateSuccess'));
      setHasUnsavedChanges(false);
      onRoleUpdated?.({ id: role.id, name, rank, description, color });
    } catch (error) {
      systemFeedbackService.warning(translate('Message.RoleUpdateFail'));
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteClicked = () => setIsDeleteDialogOpen(true);

  const onDeleteRole = async () => {
    setIsDeleting(true);
    try {
      await groupRolesService.deleteGroupRole(groupId, role.id);
      onRoleDeleted?.(role.id);
      systemFeedbackService.success(translate('Message.RoleDeleteSuccess'));
    } catch (error) {
      systemFeedbackService.warning(translate('Message.RoleDeleteFail'));
    } finally {
      setIsDeleting(false);
    }
  };

  const nameCharacterCount = `${name.length}/${nameMaxLength}`;
  const descriptionCharacterCount = `${description.length}/${descriptionMaxLength}`;

  const renderDeleteDialogMessage = () => {
    if (allowDeleteRoleSetWithUsers && !roleHasNoMembers) {
      return showAutoAssignWarning
        ? translate('Message.DeleteRoleWithUsersAutoAssignWarning', {
            amount: role.memberCount ?? 0,
            role: role.name
          })
        : translate('Message.RoleWithUsersAllowDeletion', {
            amount: role.memberCount ?? 0,
            role: role.name
          });
    }
    return showAutoAssignWarning
      ? translate('Message.DeleteRoleAutoAssignWarning', { role: role.name })
      : translate('Message.DeleteRoleset', { role: role.name });
  };

  return (
    <div className='width-full'>
      <div className='padding-bottom-large'>
        <TextInput
          label={translate('Label.RoleName')}
          maxLength={nameMaxLength}
          value={name}
          isDisabled={isNameFieldDisabled}
          onChange={onNameChanged}
        />
        <span className='block text-caption-small text-align-x-right'>{nameCharacterCount}</span>
      </div>
      <div className='padding-bottom-large'>
        <TextInput
          label={`${translate('Heading.Rank')} (${minRank}-${maxRank})`}
          type='number'
          min={minRank}
          max={maxRank}
          value={rank.toString()}
          isDisabled={isRankFieldDisabled}
          hasError={rankHasError}
          onChange={onRankChanged}
        />
        {rankErrorMessage && (
          <span className='block text-caption-small text-alert padding-top-xsmall'>
            {rankErrorMessage}
          </span>
        )}
      </div>
      <div className='padding-bottom-large'>
        <TextArea
          label={translate('Heading.Description')}
          textareaStyle={{ resize: 'vertical', minHeight: '150px' }}
          maxLength={descriptionMaxLength}
          value={description}
          isDisabled={isDescriptionFieldDisabled}
          onChange={onDescriptionChanged}
        />
        <span className='block text-caption-small text-align-x-right'>
          {descriptionCharacterCount}
        </span>
      </div>
      {showRoleColorPicker && (
        <div className='padding-bottom-large'>
          <h2 id='roleColorPicker' className='text-title-large content-emphasis padding-top-none'>
            {translate('Heading.RoleColor')}
          </h2>
          <div aria-labelledby='roleColorPicker' className='role-color-picker-list' role='group'>
            {pickableRoleColorsList.map(roleColor => {
              const tokensForRoleColor = colorIntToColorTokenMap[roleColor];
              const colorName = translate(tokensForRoleColor.TranslationId);
              const {
                light: colorDotLightToken,
                dark: colorDotDarkToken
              } = getColorDotCustomPropertyTokens(roleColor, color, tokensForRoleColor);

              return (
                <button
                  key={roleColor}
                  type='button'
                  data-role-color={roleColor}
                  className='color-dot'
                  style={
                    {
                      '--color-dot-light': `var(--${colorDotLightToken})`,
                      '--color-dot-dark': `var(--${colorDotDarkToken})`
                    } as React.CSSProperties
                  }
                  aria-label={colorName}
                  title={colorName}
                  onClick={() => onColorSelected(roleColor)}>
                  {color === roleColor && roleColor !== RoleColorValues.Invalid && (
                    <Icon name='icon-filled-check' size='Medium' className='color-dot-check' />
                  )}
                  {roleColor === RoleColorValues.Invalid && (
                    <Icon
                      name='icon-filled-circle-slash'
                      size='Medium'
                      className={invalidRoleColorSlashIconClassName(color === roleColor, theme)}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showDeleteRole && (
        <div className='flex flex-col gap-medium items-start'>
          {!allowDeleteRoleSetWithUsers &&
            (roleHasNoMembers ? (
              <span>{translate('Label.PermDeleteRole')}</span>
            ) : (
              <span>
                {translate('Message.RoleWithUsers', {
                  amount: role.memberCount ?? 0
                })}
              </span>
            ))}
          <Button
            variant='Alert'
            size='Small'
            isDisabled={!canDeleteRole}
            onClick={onDeleteClicked}
            isLoading={isDeleting}>
            {translate('Action.DeleteRole')}
          </Button>
        </div>
      )}

      {showSaveButton && (
        <div className='flex gap-medium margin-top-medium'>
          <Button
            variant='Emphasis'
            size='Medium'
            isDisabled={isSaveButtonDisabled}
            isLoading={isSaving}
            onClick={onSaveClicked}>
            {translate('Action.Save')}
          </Button>
        </div>
      )}

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        size='Small'
        isModal
        hasCloseAffordance
        closeLabel={translate('Action.Close')}>
        <DialogContent>
          <DialogBody className='flex flex-col gap-y-xsmall'>
            <DialogTitle className='text-heading-medium margin-none'>
              {translate('Action.DeleteRole')}
            </DialogTitle>
            <div
              className={`text-body-medium ${
                showAutoAssignWarning ? 'content-alert' : 'content-default'
              }`}>
              {renderDeleteDialogMessage()}
            </div>
          </DialogBody>
          <DialogFooter className='flex gap-x-small'>
            <Button
              variant='Alert'
              className='fill basis-0'
              isLoading={isDeleting}
              onClick={onDeleteRole}>
              {translate('Action.Delete')}
            </Button>
            <Button
              variant='Standard'
              className='fill basis-0'
              isDisabled={isDeleting}
              onClick={() => setIsDeleteDialogOpen(false)}>
              {translate('Action.Cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsTab;
