import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Divider,
  TextArea,
  TextInput
} from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import groupRolesService from '../services/groupRolesService';
import { Role } from '../../shared/types';
import { useConfigurationMetadata } from '../../shared/contexts/ConfigurationMetadataContext';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import { getMaxAssignableRank } from '../../shared/utils/communityOwnership';

type CreateRoleDialogProps = {
  groupId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleCreated?: (newRole: Role) => void;
  onRoleCreateError?: (error: unknown) => void;
};

const CreateRoleDialog: React.FC<CreateRoleDialogProps> = ({
  groupId,
  open,
  onOpenChange,
  onRoleCreated,
  onRoleCreateError
}) => {
  const { translate } = useTranslation();

  const { roleConfiguration } = useConfigurationMetadata();
  const { nameMaxLength, descriptionMaxLength, minRank, maxRank } = roleConfiguration;
  const { features } = useCommunityProductFeatures();
  const upperRankInclusive = getMaxAssignableRank(maxRank, features.IsOwnerRolesetDeprecated);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [rank, setRank] = useState<number>(minRank + 1);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const isCreateDisabled = rank <= minRank || rank > upperRankInclusive || name.trim().length === 0;
  const nameCharacterCount = `${name.length}/${nameMaxLength}`;
  const descriptionCharacterCount = `${description.length}/${descriptionMaxLength}`;

  const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value);

  const onRankChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = Number(event.target.value);
    if (
      !Number.isNaN(numericValue) &&
      numericValue > minRank &&
      numericValue <= upperRankInclusive
    ) {
      setRank(numericValue);
    }
  };

  const onDescriptionChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
    setDescription(event.target.value);

  const createRole = async () => {
    setIsCreating(true);

    try {
      const newRole = await groupRolesService.createGroupRole(groupId, {
        name,
        description,
        rank
      });

      onRoleCreated?.(newRole);
    } catch (error) {
      onRoleCreateError?.(error);
    } finally {
      setIsCreating(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size='Medium'
      isModal
      hasCloseAffordance
      closeLabel={translate('Action.Close')}>
      <DialogContent>
        <DialogBody>
          <DialogTitle>{translate('Action.CreateRole')}</DialogTitle>
          <Divider className='padding-y-medium' />
          <div className='padding-bottom-small'>
            <TextInput
              inputContainerClassName='bg-shift-100'
              label={translate('Label.RoleName')}
              maxLength={nameMaxLength}
              value={name}
              onChange={onNameChanged}
            />
            <span className='block text-caption-small text-align-x-right'>
              {nameCharacterCount}
            </span>
          </div>
          <div className='padding-bottom-large'>
            <TextInput
              inputContainerClassName='bg-shift-100'
              label={`${translate('Heading.Rank')} (${minRank + 1}-${upperRankInclusive})`}
              type='number'
              min={minRank + 1}
              max={upperRankInclusive}
              value={rank.toString()}
              onChange={onRankChanged}
            />
          </div>
          <div className='padding-bottom-small'>
            <TextArea
              textareaClassName='bg-shift-100'
              label={translate('Heading.Description')}
              textareaStyle={{ resize: 'vertical', minHeight: '150px' }}
              maxLength={descriptionMaxLength}
              value={description}
              onChange={onDescriptionChanged}
            />
            <span className='block text-caption-small text-align-x-right'>
              {descriptionCharacterCount}
            </span>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className='flex gap-x-small'>
            <Button variant='Standard' className='fill basis-0' onClick={() => onOpenChange(false)}>
              {translate('Action.Cancel')}
            </Button>
            <Button
              variant='Emphasis'
              className='fill basis-0'
              isLoading={isCreating}
              isDisabled={isCreateDisabled}
              onClick={createRole}>
              {translate('Action.Create')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleDialog;
