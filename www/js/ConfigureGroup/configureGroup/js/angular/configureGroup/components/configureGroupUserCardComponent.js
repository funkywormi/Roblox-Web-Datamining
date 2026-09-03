import configureGroupModule from '../configureGroupModule';

const configureGroupUserCard = {
  templateUrl: 'configure-group-user-card',
  bindings: {
    group: '<',
    user: '<',
    actingUser: '<',
    showGroupBanDetails: '<',
    actingUserPermissions: '<',
  },
  controller: 'configureGroupUserCardController'
};

configureGroupModule.component('configureGroupUserCard', configureGroupUserCard);
export default configureGroupUserCard;
