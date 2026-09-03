import revenueModule from '../revenueModule';

const revenueSummary = {
  templateUrl: 'revenue-summary',
  bindings: {
    targetId: '<',
    targetType: '@'
  },
  controller: 'revenueSummaryController'
};

revenueModule.component('revenueSummary', revenueSummary);
export default revenueSummary;
