import resellersModule from '../resellersModule.js';

const verticalBarChartComponent = {
  templateUrl: 'vertical-bar-chart',
  bindings: {
    chartDataPoints: '<',
    days: '<'
  },
  controller: 'verticalBarChartController'
};

resellersModule.component('verticalBarChart', verticalBarChartComponent);
export default verticalBarChartComponent;
