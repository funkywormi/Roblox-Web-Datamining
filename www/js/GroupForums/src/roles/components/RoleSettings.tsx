import type { FunctionComponent } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { TextArea, TextInput, Button, Icon, Radio, RadioGroup } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import { Grid, DialogTemplate, useDialog, useTheme } from '@rbx/ui';
import type { GroupRoleColorType } from '../../clients/groups';
import type { GroupRoleMetadata } from '../../clients/groups';
import TranslationNamespace from '../../constants/TranslationNamespace';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import {
  useGetGroupConfigurationMetadata,
  useGetGroupProductFeatures,
} from '../../queries/rolesQueries';
import {
  DefaultMemberRoleIdNumber,
  DefaultRoleColor,
  DefaultRoleDescriptionMaxLength,
  DefaultRoleMaxRank,
  DefaultRoleMinRank,
  DefaultRoleNameMaxLength,
  getColorDotTokens,
  PickableRoleColorsList,
  RoleColorTokenMap,
  RoleVisibility,
} from '../../utils/constants';
import { OrganizationsEventName, logOrganizationsEvent } from '../../utils/eventUtils';
import { canEditRoleMetadata } from '../../utils/groupPermissions';
import RoleIdCopyRow from './RoleIdCopyRow';

export type RoleSettingsProps = {
  role: GroupRoleMetadata;
  onSave: (role: GroupRoleMetadata) => Promise<void>;
  onDelete: (role: GroupRoleMetadata) => void;
  saving?: boolean;
  disabled?: boolean;
};

const RoleSettings: FunctionComponent<React.PropsWithChildren<RoleSettingsProps>> = ({
  role,
  onSave,
  onDelete,
  saving = false,
  disabled = false,
}) => {
  const { translate, translateWithNamespace } = useTranslation();
  const { palette } = useTheme();
  const { group, isOwner, organization, permissions, rolePermissions, unifiedLogger } =
    useCurrentGroup();
  const { configure: configureDialog, open: openDialog, close: closeDialog } = useDialog();

  const { data: configMetadata } = useGetGroupConfigurationMetadata();
  const { data: productFeatures, isLoading: isProductFeaturesLoading } = useGetGroupProductFeatures(
    group?.id,
  );
  // Hidden until product features load so it never flashes in then out when the flag is on;
  // it pops in only once we know HideRoleDescription is off.
  const showRoleDescription =
    !isProductFeaturesLoading && !(productFeatures?.hideRoleDescription ?? false);
  const roleConfig = configMetadata?.roleConfiguration;
  const nameMaxLength = roleConfig?.nameMaxLength ?? DefaultRoleNameMaxLength;
  const descriptionMaxLength = roleConfig?.descriptionMaxLength ?? DefaultRoleDescriptionMaxLength;
  const minRank = roleConfig?.minRank ?? DefaultRoleMinRank;
  const maxRank = roleConfig?.maxRank ?? DefaultRoleMaxRank;

  const isBaseMemberRole = role.id === DefaultMemberRoleIdNumber;

  const [name, setName] = useState<string>(role?.name ?? '');
  const [rank, setRank] = useState<number>(role?.rank ?? minRank);
  const [description, setDescription] = useState<string>(role?.description ?? '');
  const [color, setColor] = useState<GroupRoleColorType | null | undefined>(role?.color);
  const [isPrivate, setIsPrivate] = useState<boolean>(role?.isPrivate ?? false);

  const hasUnsavedChanges =
    name !== (role?.name ?? '') ||
    rank !== (role?.rank ?? minRank) ||
    description !== (role?.description ?? '') ||
    color !== role?.color ||
    isPrivate !== (role?.isPrivate ?? false);

  const rankErrorMessage = useMemo((): string | undefined => {
    if (isBaseMemberRole) {
      return undefined;
    }
    if (Number.isNaN(rank)) {
      return translateWithNamespace(TranslationNamespace.GroupManagement, 'Error.RankFieldEmpty');
    }
    if (rank < minRank || rank > maxRank) {
      return translateWithNamespace(TranslationNamespace.GroupManagement, 'Error.RankFieldInvalid');
    }
    if (rank === minRank) {
      return translateWithNamespace(
        TranslationNamespace.Groups,
        'Message.RankReservedOnlyForGuest',
        {
          minRankPlusOne: String(minRank + 1),
          minRank: String(minRank),
          maxRank: String(maxRank),
        },
      );
    }
    return undefined;
  }, [isBaseMemberRole, rank, minRank, maxRank, translateWithNamespace]);

  const rankHasError = rankErrorMessage !== undefined;

  const handleCancel = useCallback(() => {
    setName(role?.name ?? '');
    setColor(role?.color);
    setDescription(role?.description ?? '');
    setRank(role?.rank ?? DefaultRoleMinRank);
    setIsPrivate(role?.isPrivate ?? false);
  }, [role]);

  const handleSave = useCallback(async () => {
    if (!name?.trim() || color === undefined || color === null || !hasUnsavedChanges) {
      return;
    }

    const newMetadata: GroupRoleMetadata = {
      ...role,
      name,
      color,
      description,
      rank,
      isPrivate,
    };

    await onSave(newMetadata);

    logOrganizationsEvent(unifiedLogger, OrganizationsEventName.ClickOrgsUpdateRoleSettings, {
      group_id: organization?.groupId ?? '',
      role_id: role?.id?.toString() ?? '',
    });
  }, [
    role,
    name,
    color,
    description,
    rank,
    onSave,
    isPrivate,
    unifiedLogger,
    organization,
    hasUnsavedChanges,
  ]);

  const handleSelectColor = useCallback(
    (newColor: GroupRoleColorType) => {
      if (disabled || saving) {
        return;
      }
      setColor(newColor);
    },
    [setColor, disabled, saving],
  );

  const onNameChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const onRankChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = Number(e.target.value);
    if (!Number.isNaN(numericValue)) {
      setRank(numericValue);
    }
  }, []);

  const onDescriptionChanged = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);

  const onVisibilityChanged = useCallback((value: string) => {
    setIsPrivate(value === RoleVisibility.Private);
  }, []);

  const handleCancelDialog = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const handleConfirmDialog = useCallback(() => {
    onDelete(role);
    closeDialog();
  }, [closeDialog, onDelete, role]);

  const confirmRemoveUserDialog = useMemo(() => {
    const memberCount = role.memberCount ?? 0;
    const deleteDialogContent =
      memberCount === 1
        ? translateWithNamespace(
            TranslationNamespace.GroupManagement,
            'Message.RoleWithUserAllowDeletion',
            { role: role.name ?? '' },
          )
        : memberCount > 1
          ? translateWithNamespace(
              TranslationNamespace.GroupManagement,
              'Message.RoleWithUsersAllowDeletion',
              { numUsers: memberCount.toString(), role: role.name ?? '' },
            )
          : translateWithNamespace(TranslationNamespace.Groups, 'Message.DeleteRoleset', {
              role: role.name ?? '',
            });

    return (
      <DialogTemplate
        variant='alert'
        color='destructive'
        title={translate('Action.DeleteRole')}
        content={deleteDialogContent}
        cancelText={translate('Action.Cancel')}
        confirmText={translate('Action.Delete')}
        onCancel={handleCancelDialog}
        onConfirm={handleConfirmDialog}
      />
    );
  }, [handleCancelDialog, handleConfirmDialog, translate, translateWithNamespace, role]);

  const handleOpenDialog = useCallback(() => {
    configureDialog(confirmRemoveUserDialog);
    openDialog();
  }, [configureDialog, openDialog, confirmRemoveUserDialog]);

  const isSaveButtonDisabled = !name.trim() || rankHasError || !hasUnsavedChanges;

  const showDeleteRole =
    (isOwner === true || permissions?.canDeleteRoles === true) && !isBaseMemberRole;

  const permissionsForRole =
    role.id === undefined ? undefined : rolePermissions?.[role.id.toString()];
  const canEditVisibility = canEditRoleMetadata(permissionsForRole);

  const showVisibility = canEditVisibility && !isBaseMemberRole;

  return (
    <Grid
      container
      direction='row'
      alignContent='flex-start'
      wrap='wrap'
      className='padding-top-large padding-bottom-large'
      gap={3}>
      <Grid container item XSmall={12}>
        <div className={`width-full${showRoleDescription ? ' padding-bottom-large' : ''}`}>
          <TextInput
            label={translateWithNamespace(TranslationNamespace.GroupManagement, 'Label.RoleName')}
            maxLength={nameMaxLength}
            value={name}
            isDisabled={disabled || saving}
            onChange={onNameChanged}
          />
          <span className='block text-caption-medium text-align-x-end'>
            {name.length}/{nameMaxLength}
          </span>
        </div>
        {showRoleDescription && (
          <div className='width-full'>
            <TextArea
              label={translateWithNamespace(TranslationNamespace.Groups, 'Heading.Description')}
              textareaStyle={{ resize: 'vertical', minHeight: '150px' }}
              maxLength={descriptionMaxLength}
              value={description}
              isDisabled={disabled || saving}
              onChange={onDescriptionChanged}
            />
            <span className='block text-caption-medium text-align-x-end'>
              {description.length}/{descriptionMaxLength}
            </span>
          </div>
        )}
      </Grid>
      {!isBaseMemberRole && (
        <Grid container item XSmall={12} wrap='wrap'>
          <div className='block text-title-large padding-bottom-small'>
            {translateWithNamespace(TranslationNamespace.GroupManagement, 'Label.RoleColor')}
          </div>
          <Grid container item XSmall={12} wrap='wrap'>
            <Grid container className='wrap gap-medium' style={{ maxWidth: 340 }}>
              {PickableRoleColorsList.map((roleColorType) => {
                const tokens = RoleColorTokenMap[roleColorType];
                const bgToken = getColorDotTokens(roleColorType, color, palette.mode);
                const colorName = translateWithNamespace(
                  TranslationNamespace.GroupManagement,
                  tokens.translationKey,
                );
                return (
                  <button
                    key={roleColorType}
                    type='button'
                    data-role-color={roleColorType}
                    className={`flex radius-circle outline-none padding-none${!disabled && !saving ? ' cursor-pointer' : ''}`}
                    style={{
                      width: 32,
                      height: 32,
                      border: 'none',
                      background: `var(--${bgToken})`,
                    }}
                    aria-label={colorName}
                    title={colorName}
                    onClick={() => handleSelectColor(roleColorType)}>
                    {color === roleColorType && roleColorType !== DefaultRoleColor && (
                      <Icon
                        name='icon-filled-check'
                        size='Medium'
                        className='margin-auto content-emphasis'
                      />
                    )}
                    {roleColorType === DefaultRoleColor && (
                      <Icon
                        name='icon-filled-circle-slash'
                        size='Medium'
                        className={`margin-auto ${color === roleColorType ? 'content-action-sub-emphasis' : 'content-emphasis'}`}
                      />
                    )}
                  </button>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      )}
      <div className='padding-bottom-large width-full'>
        <TextInput
          label={`${translateWithNamespace(TranslationNamespace.Groups, 'Heading.Rank')} (${minRank}-${maxRank})`}
          type='number'
          min={minRank}
          max={maxRank}
          value={rank.toString()}
          isDisabled={disabled || saving || isBaseMemberRole}
          hasError={rankHasError}
          onChange={onRankChanged}
          helperText={
            rankErrorMessage ??
            translateWithNamespace(TranslationNamespace.GroupManagement, 'Subtext.Rank')
          }
        />
      </div>
      {showVisibility && (
        <div className='width-full'>
          <div className='block text-title-large padding-bottom-small'>
            {translateWithNamespace(TranslationNamespace.GroupManagement, 'Label.Visibility')}
          </div>
          <RadioGroup
            size='Medium'
            value={isPrivate ? RoleVisibility.Private : RoleVisibility.Public}
            isDisabled={disabled || saving}
            onValueChange={onVisibilityChanged}>
            <Radio
              value={RoleVisibility.Public}
              label={translateWithNamespace(
                TranslationNamespace.GroupManagement,
                'Label.VisibilityPublic',
              )}
              hint={translateWithNamespace(
                TranslationNamespace.GroupManagement,
                'Subtext.VisibilityPublic',
              )}
            />
            <Radio
              value={RoleVisibility.Private}
              label={translateWithNamespace(
                TranslationNamespace.GroupManagement,
                'Label.VisibilityPrivate',
              )}
              hint={translateWithNamespace(
                TranslationNamespace.GroupManagement,
                'Subtext.VisibilityPrivate',
              )}
            />
          </RadioGroup>
        </div>
      )}
      {!disabled && (
        <Grid container item XSmall={12} className='flex-row' gap={1}>
          <Button
            variant='Emphasis'
            size='Medium'
            isDisabled={isSaveButtonDisabled}
            onClick={handleSave}
            isLoading={saving}>
            {translateWithNamespace(TranslationNamespace.GroupManagement, 'Action.Save')}
          </Button>
          <Button
            variant='Standard'
            size='Medium'
            onClick={handleCancel}
            isDisabled={saving || !hasUnsavedChanges}>
            {translateWithNamespace(TranslationNamespace.GroupManagement, 'Action.Cancel')}
          </Button>
          {showDeleteRole && (
            <Button
              variant='Alert'
              size='Medium'
              aria-label='delete-role'
              isDisabled={disabled || saving}
              onClick={handleOpenDialog}>
              {translateWithNamespace(TranslationNamespace.GroupManagement, 'Action.DeleteRole')}
            </Button>
          )}
        </Grid>
      )}
      {role.id != null && <RoleIdCopyRow roleId={role.id} />}
    </Grid>
  );
};

export default RoleSettings;
