import groupPayoutsModule from '../groupPayoutsModule.js';

const configureGroupPayouts = {
  templateUrl: 'configure-group-payouts',
  bindings: {
    groupId: '<',
    groupFunds: '<',
    reloadGroupFunds: '='
  },
  controller: 'configureGroupPayoutsController'
};

groupPayoutsModule.component('configureGroupPayouts', configureGroupPayouts);

export default configureGroupPayouts;
