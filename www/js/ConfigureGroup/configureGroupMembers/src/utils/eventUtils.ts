import type { UnifiedLogger } from '@rbx/unified-logger';

export enum OrganizationsEventName {
  ClickOrgsInviteMember = 'clickOrgsInviteMember',
  ClickOrgsUninviteMember = 'clickOrgsUninviteMember',
  ClickOrgsRemoveMember = 'clickOrgsRemoveMember',
  ClickOrgsAddRoleToMember = 'clickOrgsAddRoleToMember',
  ClickOrgsRemoveRoleFromMember = 'clickOrgsRemoveRoleFromMember',
  ClickOrgsCreateRole = 'clickOrgsCreateRole',
  ClickOrgsDeleteRole = 'clickOrgsDeleteRole',
  ClickOrgsUpdateRolePermissions = 'clickOrgsUpdateRolePermissions',
  ClickOrgsUpdateRoleSettings = 'clickOrgsUpdateRoleSettings',
  ClickOrgsAddMemberToRole = 'clickOrgsAddMemberToRole',
  ClickOrgsRemoveMemberFromRole = 'clickOrgsRemoveMemberFromRole',
  ClickOrgsUpdateGroupProfile = 'clickOrgsUpdateGroupProfile',
  ClickOrgsConfirmOneTimePayout = 'clickOrgsConfirmOneTimePayout',
  ClickOrgsConfirmRecurringPayout = 'clickOrgsConfirmRecurringPayout',
  ClickOrgsOpenGroupInvitationsDialog = 'clickOrgsOpenGroupInvitationsDialog',
  ClickOrgsGroupInvitationsDialogSearchResult = 'clickOrgsGroupInvitationsDialogSearchResult',
  ClickOrgsGroupInvitationsDialogInviteSelectedUsers = 'clickOrgsGroupInvitationsDialogInviteSelectedUsers',
  ClickOrgsGroupInvitationsDialogCancel = 'clickOrgsGroupInvitationsDialogCancel',
}

export const logOrganizationsEvent = (
  client: UnifiedLogger | undefined,
  eventName: OrganizationsEventName,
  params: Record<string, string> = {},
) => {
  if (!client) {
    return;
  }
  client.logClickEvent({
    eventName,
    parameters: { ...params },
  });
};
