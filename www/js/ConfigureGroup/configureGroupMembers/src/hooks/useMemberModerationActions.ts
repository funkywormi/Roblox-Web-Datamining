import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from '@rbx/intl';
import TranslationNamespace from '../constants/TranslationNamespace';
import { useDeleteInvitation } from '../queries';
import type { Member } from '../utils/constants';
import { GroupMembersMenuState } from '../utils/constants';
import { OrganizationsEventName, logOrganizationsEvent } from '../utils/eventUtils';
import useCurrentGroup from './useCurrentGroup';
import useMemberPermissions from './useMemberPermissions';

export type MemberOverflowAction = {
  value: string;
  title: string;
  isDestructive?: boolean;
  onSelect: () => void;
};

type MemberModerationActions = {
  overflowActions: MemberOverflowAction[];
  isRemoveDialogOpen: boolean;
  closeRemoveDialog: () => void;
};

/**
 * Builds the overflow menu for a member row. Kicking requires `canKickMembers` plus outranking
 * the member; uninviting only requires `canInviteMembers`.
 */
const useMemberModerationActions = (
  member: Member,
  menuState: GroupMembersMenuState,
): MemberModerationActions => {
  const { translate, translateWithNamespace } = useTranslation();
  const { organization, navigation, unifiedLogger, showToast } = useCurrentGroup();
  const { canKickMember, canUninviteMember } = useMemberPermissions();
  const { mutate: deleteInvitation } = useDeleteInvitation();

  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const closeRemoveDialog = useCallback(() => setIsRemoveDialogOpen(false), []);

  const copyGroupLink = useCallback(() => {
    if (!organization?.id || !navigation.getInvitationLinkUrl) {
      return;
    }
    const url = navigation.getInvitationLinkUrl(organization.id);
    void navigator.clipboard.writeText(url).then(() => {
      showToast(translate('Message.LinkCopied'));
    });
  }, [organization, navigation, showToast, translate]);

  const uninviteMember = useCallback(() => {
    if (!organization?.id || !('invitationId' in member)) {
      return;
    }
    deleteInvitation(
      { organizationId: organization.id, member },
      {
        onSuccess: () => showToast(translate('Message.InvitationDeleted')),
        onError: () => showToast(translate('Error.DeletingInvitation'), true),
      },
    );
    logOrganizationsEvent(unifiedLogger, OrganizationsEventName.ClickOrgsUninviteMember, {
      group_id: organization.groupId ?? '',
      user_id: member.user?.userId?.toString() ?? '',
    });
  }, [organization, member, deleteInvitation, unifiedLogger, showToast, translate]);

  const overflowActions = useMemo(() => {
    const actions: MemberOverflowAction[] = [];

    if (menuState === GroupMembersMenuState.Invited) {
      if (navigation.getInvitationLinkUrl) {
        actions.push({
          value: 'copy-group-link',
          title: translate('Label.CopyGroupLink'),
          onSelect: copyGroupLink,
        });
      }
      if (canUninviteMember) {
        actions.push({
          value: 'uninvite',
          title: translate('Action.Uninvite'),
          isDestructive: true,
          onSelect: uninviteMember,
        });
      }
      return actions;
    }

    if (canKickMember(member)) {
      actions.push({
        value: 'remove',
        title: translateWithNamespace(TranslationNamespace.Groups, 'Action.KickUser'),
        isDestructive: true,
        onSelect: () => setIsRemoveDialogOpen(true),
      });
    }

    return actions;
  }, [
    menuState,
    navigation,
    translate,
    translateWithNamespace,
    copyGroupLink,
    canUninviteMember,
    uninviteMember,
    canKickMember,
    member,
  ]);

  return { overflowActions, isRemoveDialogOpen, closeRemoveDialog };
};

export default useMemberModerationActions;
