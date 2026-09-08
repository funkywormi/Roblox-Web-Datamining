import type { FunctionComponent } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  TextInput,
  Toggle,
} from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import TranslationNamespace from '../../constants/TranslationNamespace';
import { useGetGroupConfigurationMetadata } from '../../queries/rolesQueries';
import { DefaultRoleNameMaxLength } from '../../utils/constants';

export type CreateRoleModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, isPrivate: boolean) => Promise<void>;
  saving?: boolean;
  canSetVisibility?: boolean;
};

const CreateRoleModal: FunctionComponent<CreateRoleModalProps> = ({
  open,
  onClose,
  onConfirm,
  saving = false,
  canSetVisibility = false,
}) => {
  const { translateWithNamespace } = useTranslation();
  const { data: configMetadata } = useGetGroupConfigurationMetadata();
  const roleConfig = configMetadata?.roleConfiguration;
  const nameMaxLength = roleConfig?.nameMaxLength ?? DefaultRoleNameMaxLength;

  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setName('');
      setIsPrivate(false);
    }
  }

  const isCreateDisabled = !name.trim() || saving;

  const handleCreate = useCallback(async () => {
    if (isCreateDisabled) {
      return;
    }
    await onConfirm(name.trim(), isPrivate);
  }, [isCreateDisabled, onConfirm, name, isPrivate]);

  const onNameChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleOpenAutoFocus = useCallback(
    (event: Event) => {
      if (saving) {
        return;
      }

      event.preventDefault();
      nameInputRef.current?.focus();
    },
    [saving],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
      isModal
      size='Small'
      hasCloseAffordance
      closeLabel={translateWithNamespace(TranslationNamespace.GroupManagement, 'Action.Close')}>
      <DialogContent onOpenAutoFocus={handleOpenAutoFocus}>
        <DialogBody className='flex flex-col gap-medium'>
          <DialogTitle className='text-heading-small margin-none'>
            {translateWithNamespace(TranslationNamespace.GroupManagement, 'Heading.CreateRole')}
          </DialogTitle>
          <div className='flex flex-col gap-small'>
            <div>
              <TextInput
                ref={nameInputRef}
                label={translateWithNamespace(
                  TranslationNamespace.GroupManagement,
                  'Label.RoleName',
                )}
                maxLength={nameMaxLength}
                value={name}
                isDisabled={saving}
                onChange={onNameChanged}
              />
              <span className='block text-caption-medium text-align-x-end'>
                {name.length}/{nameMaxLength}
              </span>
            </div>
            {canSetVisibility && (
              <Toggle
                size='Medium'
                placement='Start'
                label={translateWithNamespace(
                  TranslationNamespace.GroupManagement,
                  'Label.MarkRolePrivate',
                )}
                hint={translateWithNamespace(
                  TranslationNamespace.GroupManagement,
                  'Subtext.VisibilityPrivate',
                )}
                isChecked={isPrivate}
                isDisabled={saving}
                onCheckedChange={setIsPrivate}
              />
            )}
          </div>
        </DialogBody>
        <DialogFooter className='flex width-full gap-x-small'>
          <Button
            variant='Emphasis'
            size='Medium'
            isDisabled={isCreateDisabled}
            isLoading={saving}
            className='grow-1'
            onClick={handleCreate}>
            {translateWithNamespace(TranslationNamespace.GroupManagement, 'Action.Create')}
          </Button>
          <Button
            variant='Standard'
            size='Medium'
            isDisabled={saving}
            className='grow-1'
            onClick={onClose}>
            {translateWithNamespace(TranslationNamespace.GroupManagement, 'Action.Cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleModal;
