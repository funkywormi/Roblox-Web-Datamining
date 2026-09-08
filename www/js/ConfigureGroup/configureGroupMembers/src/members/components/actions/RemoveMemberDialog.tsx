import type { FunctionComponent } from 'react';
import React, { useCallback } from 'react';
import { useTranslation } from '@rbx/intl';
import { Dialog, DialogTemplate } from '@rbx/ui';
import useCurrentGroup from '../../../hooks/useCurrentGroup';
import { useRemoveMemberFromGroup } from '../../../queries';
import type { Member } from '../../../utils/constants';
import { OrganizationsEventName, logOrganizationsEvent } from '../../../utils/eventUtils';

export type RemoveMemberDialogProps = {
  open: boolean;
  onClose: () => void;
  member: Member;
  username?: string;
};

/** Confirmation for kicking a member out of the group. */
const RemoveMemberDialog: FunctionComponent<RemoveMemberDialogProps> = ({
  open,
  onClose,
  member,
  username,
}) => {
  const { translate } = useTranslation();

  const { organization, unifiedLogger, showToast } = useCurrentGroup();
  const { mutate: removeMemberFromGroup } = useRemoveMemberFromGroup();

  const handleConfirmDialog = useCallback(() => {
    if (!organization?.groupId || !member.user?.userId) {
      return;
    }
    removeMemberFromGroup(
      { groupId: organization.groupId, member },
      {
        onSuccess: () => {
          showToast(translate('Message.UserRemoved'));
        },
        onError: () => {
          showToast(translate('Error.RemovingUser'), true);
        },
      },
    );
    logOrganizationsEvent(unifiedLogger, OrganizationsEventName.ClickOrgsRemoveMember, {
      group_id: organization?.groupId ?? '',
      user_id: member.user?.userId?.toString() ?? '',
    });
    onClose();
  }, [removeMemberFromGroup, unifiedLogger, organization, member, onClose, showToast, translate]);

  return (
    <Dialog open={open}>
      <DialogTemplate
        color='destructive'
        title={translate('Action.RemoveUsername', {
          username: username ?? '',
        })}
        content={translate('Message.RemoveUsername', {
          username: username ?? '',
        })}
        confirmText={translate('Action.Remove')}
        onConfirm={handleConfirmDialog}
        cancelText={translate('Action.Cancel')}
        onCancel={onClose}
      />
    </Dialog>
  );
};

export default RemoveMemberDialog;
