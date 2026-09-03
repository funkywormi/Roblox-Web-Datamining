import React, { createContext, useContext } from 'react';
import { About, Actions, CommunityProfileHeader } from '@rbx/profile-platform';
import { GroupRole } from '../../groupMembersList/types';
import { GroupPermissions } from '../../shared/types';

export interface GroupProfileHeaderContextProps {
  groupId: number;
  isCommunityProfile: boolean;
  userRole: GroupRole | null;
  rolesData: GroupRole[];
  permissions: GroupPermissions;
  communityProfileHeaderData: CommunityProfileHeader;
  actionsData: Actions;
  aboutData: About;
  isGroupVerificationRequiredToJoin: boolean;
  isGracefulDegradationEnabled: boolean;
  canViewMembers?: boolean;
  joinGroup: () => void;
  cancelJoinRequest: () => void;
  showLeaveGroupOrChangeOwnerModal: () => void;
  makePrimary: () => void;
  removePrimary: () => void;
  showReportAbuseModal: () => void;
  showChangeOwnerModal: () => void;
  claimOwnership: () => void;
}

export const GroupProfileHeaderContext = createContext<GroupProfileHeaderContextProps | undefined>(
  undefined
);

export const useGroupProfileHeaderContext = (): GroupProfileHeaderContextProps => {
  const context = useContext(GroupProfileHeaderContext);
  if (!context) {
    throw new Error(
      'useGroupProfileHeaderContext must be used within a GroupProfileHeaderContextProvider'
    );
  }
  return context;
};

export function GroupProfileHeaderContextProvider(
  props: GroupProfileHeaderContextProps & { children: React.ReactNode }
): JSX.Element {
  const { children } = props;

  return (
    <GroupProfileHeaderContext.Provider value={props}>
      {children}
    </GroupProfileHeaderContext.Provider>
  );
}
