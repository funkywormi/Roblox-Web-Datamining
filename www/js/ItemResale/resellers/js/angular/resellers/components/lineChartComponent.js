import resellersModule from '../resellersModule.js';

const lineChartComponent = {
  templateUrl: 'line-chart',
  bindings: {
    chartDataPoints: '<',
    days: '<'
  },
  controller: 'lineChartController'
};

resellersModule.component('lineChart', lineChartComponent);
export default lineChartComponent;
