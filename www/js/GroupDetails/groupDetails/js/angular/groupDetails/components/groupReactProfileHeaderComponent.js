import groupModule from '../groupModule';

const groupReactProfileHeader = {
  templateUrl: 'group-react-profile-header',
  bindings: {
    groupId: '<',
    isCommunityProfile: '<',
    rolesData: '<',
    userRole: '<',
    permissions: '<',
    communityProfileHeaderData: '<',
    actionsData: '<',
    aboutData: '<',
    canViewMembers: '<',
    policies: '<',
    joinGroup: '&',
    cancelJoinRequest: '&',
    showLeaveGroupOrChangeOwnerModal: '&',
    makePrimary: '&',
    removePrimary: '&',
    showReportAbuseModal: '&',
    showChangeOwnerModal: '&',
    claimOwnership: '&'
  }
};

groupModule.component('groupReactProfileHeader', groupReactProfileHeader);
export default groupReactProfileHeader;
