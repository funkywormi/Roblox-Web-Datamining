import groupPayoutsModule from '../groupPayoutsModule.js';

const groupPayouts = {
  templateUrl: 'group-payouts',
  bindings: {
    groupId: '<',
    groupFunds: '<',
    policies: '<'
  },
  controller: 'groupPayoutsController'
};

groupPayoutsModule.component('groupPayouts', groupPayouts);

export default groupPayouts;
