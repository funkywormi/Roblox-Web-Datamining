import groupPayoutsModule from '../groupPayoutsModule.js';

const groupAddFunds = {
  templateUrl: 'group-add-funds',
  bindings: {
        "group": "<"
  },
  controller: 'groupAddFundsController'
};

groupPayoutsModule.component('groupAddFunds', groupAddFunds);
export default groupAddFunds;
