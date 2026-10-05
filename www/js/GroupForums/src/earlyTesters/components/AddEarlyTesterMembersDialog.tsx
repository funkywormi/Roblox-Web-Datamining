import type { FunctionComponent } from 'react';
import React, { useCallback, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import type { GroupUserWithRoles } from '../../clients/groups';
import GroupMemberPickerList from './GroupMemberPickerList';
import MemberCountChip from './MemberCountChip';

export type AddEarlyTesterMembersDialogProps = {
  open: boolean;
  groupId: number;
  roleName: string;
  memberCount: number;
  maxMembers: number;
  existingMemberIds: ReadonlySet<number>;
  remainingCapacity: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: (members: GroupUserWithRoles[]) => void;
};

const AddEarlyTesterMembersDialog: FunctionComponent<AddEarlyTesterMembersDialogProps> = ({
  open,
  groupId,
  roleName,
  memberCount,
  maxMembers,
  existingMemberIds,
  remainingCapacity,
  onOpenChange,
  onConfirm,
}) => {
  const { translate } = useTranslation();
  const [selection, setSelection] = useState<Map<number, GroupUserWithRoles>>(new Map());

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setSelection(new Map());
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const toggleMember = useCallback((member: GroupUserWithRoles) => {
    const userId = member.user?.userId;
    if (userId == null) {
      return;
    }
    setSelection((prev) => {
      const next = new Map(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.set(userId, member);
      }
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(Array.from(selection.values()));
    handleOpenChange(false);
  }, [onConfirm, selection, handleOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      isModal
      size='Large'
      hasCloseAffordance={false}>
      <DialogContent className='width-full'>
        <DialogBody className='gap-medium flex flex-col'>
          <div className='gap-xsmall flex flex-col'>
            <DialogTitle className='text-heading-small margin-y-none'>
              {translate('Heading.InviteEarlyTesters')}
            </DialogTitle>
            <div className='items-center gap-small flex flex-row justify-between'>
              <span className='content-emphasis text-label-medium'>
                {translate('Heading.ChooseEarlyTesters')}
              </span>
              <MemberCountChip count={memberCount + selection.size} max={maxMembers} />
            </div>
            <span className='content-muted text-body-medium'>
              {translate('Description.AddMembersToRole', {
                roleName,
                maxEarlyTesters: String(maxMembers),
              })}
            </span>
          </div>
          <GroupMemberPickerList
            groupId={groupId}
            existingMemberIds={existingMemberIds}
            selection={selection}
            remainingCapacity={remainingCapacity}
            onToggleMember={toggleMember}
            showSearchLabel={false}
            listClassName='max-height-[500px] scroll-y'
          />
        </DialogBody>
        <DialogFooter className='gap-small flex flex-row'>
          <Button
            variant='Emphasis'
            size='Medium'
            className='grow-1 basis-0'
            isDisabled={selection.size === 0 || selection.size > remainingCapacity}
            onClick={handleConfirm}>
            {translate('Button.Add')}
          </Button>
          <Button
            variant='Standard'
            size='Medium'
            className='grow-1 basis-0'
            onClick={() => handleOpenChange(false)}>
            {translate('Action.Cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEarlyTesterMembersDialog;
