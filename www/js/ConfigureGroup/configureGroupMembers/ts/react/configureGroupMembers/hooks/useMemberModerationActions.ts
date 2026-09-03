import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-utilities';
import { AssignedRole, Group } from '../../shared/types';
import { useModerateDialog } from '../../shared/contexts/ModerateDialogContext';
import { useModerateUserPermissions } from '../../shared/contexts/ModerateUserPermissionsContext';
import { OverflowAction } from '../components/MemberInfoDisplay';

interface UseMemberModerationActionsParams {
  group: Group;
  onKick: (userId: number) => void;
  onBan: (userId: number) => void;
  /** Whether the acting user outranks the given member (see `canModerateMemberByRank`). */
  canModerateMember: (memberRoles?: Array<AssignedRole>) => boolean;
}

interface UseMemberModerationActionsResult {
  overflowActions: Array<OverflowAction>;
}

const useMemberModerationActions = ({
  group,
  onKick,
  onBan,
  canModerateMember
}: UseMemberModerationActionsParams): UseMemberModerationActionsResult => {
  const { translate } = useTranslation();
  const { openBanDialog, openKickDialog } = useModerateDialog();
  const { canKickUser, canBanUser } = useModerateUserPermissions();
  const ownerUserId = group.owner?.userId;

  // Offer kick/ban only with the permission, when outranking the target, and never against the owner.
  const canModerate = useCallback(
    (userId: number, memberRoles: Array<AssignedRole> | undefined, hasPermission: boolean) =>
      hasPermission && userId !== ownerUserId && canModerateMember(memberRoles),
    [ownerUserId, canModerateMember]
  );

  const openBanUserDialog = useCallback(
    (userId: number) => {
      openBanDialog({
        groupId: group.id,
        userId,
        onModerationSuccess: () => {
          onBan(userId);
        }
      });
    },
    [group.id, openBanDialog, onBan]
  );

  const openKickUserDialog = useCallback(
    (userId: number) => {
      openKickDialog({
        groupId: group.id,
        userId,
        onModerationSuccess: () => {
          onKick(userId);
        }
      });
    },
    [group.id, openKickDialog, onKick]
  );

  const kickAction = useMemo(
    () => ({
      label: translate('Action.KickUser'),
      action: openKickUserDialog,
      isVisible: (userId: number, memberRoles?: Array<AssignedRole>) =>
        canModerate(userId, memberRoles, canKickUser(userId))
    }),
    [openKickUserDialog, translate, canKickUser, canModerate]
  );

  const banAction = useMemo(
    () => ({
      label: translate('Action.BanUser'),
      action: openBanUserDialog,
      isVisible: (userId: number, memberRoles?: Array<AssignedRole>) =>
        canModerate(userId, memberRoles, canBanUser(userId))
    }),
    [openBanUserDialog, translate, canBanUser, canModerate]
  );

  const overflowActions = useMemo(() => [kickAction, banAction], [kickAction, banAction]);

  return { overflowActions };
};

export default useMemberModerationActions;
