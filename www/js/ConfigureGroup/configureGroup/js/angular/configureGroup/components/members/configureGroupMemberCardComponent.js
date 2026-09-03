import configureGroupModule from '../../configureGroupModule';

const configureGroupMemberCard = {
  templateUrl: 'configure-group-member-card',
  bindings: {
    member: '<',
    configurableRoles: '<',
    group: '<',
    metadata: '<',
    exileUser: '<',
    banUser: '<',
    updateUserRole: '<',
    index: '<'
  },
  controller: 'configureGroupMemberCardController'
};

configureGroupModule.component('configureGroupMemberCard', configureGroupMemberCard);

export default configureGroupMemberCard;
