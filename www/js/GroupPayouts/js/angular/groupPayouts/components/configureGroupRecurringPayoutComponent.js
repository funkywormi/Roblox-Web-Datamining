import groupPayoutsModule from '../groupPayoutsModule.js';

const configureGroupRecurringPayout = {
  templateUrl: 'configure-group-recurring-payout',
  bindings: {
    groupId: '<',
    groupFunds: '<'
  },
  controller: 'configureGroupRecurringPayoutController'
};

groupPayoutsModule.component('configureGroupRecurringPayout', configureGroupRecurringPayout);

export default configureGroupRecurringPayout;
