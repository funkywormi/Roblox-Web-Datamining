import angular from 'angular';
import { abbreviateNumber } from 'core-utilities';
import resellersModule from '../resellersModule.js';

function lineChartController(resellersConstants, highchartsService, $timeout) {
  'ngInject';

  const ctrl = this;

  const render = () => {
    const chartData = { ...resellersConstants.highCharts.defaultConfiguration };

    chartData.colors = [resellersConstants.highCharts.colors.lineColor];
    chartData.chart.height = resellersConstants.highCharts.lineChartHeight;
    chartData.data = highchartsService.toHighChartsData(ctrl.chartDataPoints);

    chartData.xAxis.min = highchartsService.getDateMinusDays(ctrl.days);
    chartData.xAxis.labels = {
      format: '{value:%m/%d}'
    };

    chartData.yAxis = {
      title: {
        text: ''
      },
      labels: {
        formatter() {
          return abbreviateNumber.getAbbreviatedValue(this.value, undefined, 1000);
        }
      }
    };

    const element = angular.element(`#${ctrl.lineChartId}`);
    element.highcharts(chartData);

    ctrl.highcharts = element.highcharts();
  };

  const init = () => {
    const uniqueId = new Date().getTime();
    ctrl.lineChartId = `line_chart_${uniqueId}`;

    // https://stackoverflow.com/a/22541080/1663648
    $timeout(render);
  };

  const update = () => {
    if (ctrl.highcharts) {
      ctrl.highcharts.xAxis[0].update({
        min: highchartsService.getDateMinusDays(ctrl.days)
      });
    }
  };

  ctrl.$onInit = init;
  ctrl.$onChanges = update;
}

resellersModule.controller('lineChartController', lineChartController);
export default lineChartController;
