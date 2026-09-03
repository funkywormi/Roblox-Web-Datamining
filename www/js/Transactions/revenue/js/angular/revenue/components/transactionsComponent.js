import revenueModule from '../revenueModule';

const transactions = {
  templateUrl: 'transactions',
  bindings: {
    targetId: '<',
    targetType: '@',
    transactionType: '@'
  },
  controller: 'transactionsController'
};

revenueModule.component('transactions', transactions);

export default transactions;
