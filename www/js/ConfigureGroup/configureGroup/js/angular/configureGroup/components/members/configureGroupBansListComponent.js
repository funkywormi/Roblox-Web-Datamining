import configureGroupModule from '../../configureGroupModule';

const configureGroupBansList = {
  templateUrl: 'configure-group-bans-list',
  bindings: {
    group: '<',
    metadata: '<'
  },
  controller: 'configureGroupBansListController'
};

configureGroupModule.component('configureGroupBansList', configureGroupBansList);

export default configureGroupBansList;
