import angular from 'angular';
import resellersModule from '../resellersModule.js';

function verticalBarChartController(resellersConstants, highchartsService, $timeout) {
  'ngInject';

  const ctrl = this;

  const render = () => {
    const chartData = { ...resellersConstants.highCharts.defaultConfiguration };

    chartData.chart.type = 'column';
    chartData.colors = [resellersConstants.highCharts.colors.verticalBarColor];
    chartData.chart.height = resellersConstants.highCharts.verticalBarChartHeight;
    chartData.data = highchartsService.toHighChartsData(ctrl.chartDataPoints);

    chartData.xAxis.min = highchartsService.getDateMinusDays(ctrl.days);
    chartData.xAxis.labels = {
      enabled: false
    };

    chartData.yAxis = {
      gridLineWidth: 0,
      minorGridLineWidth: 0,
      title: {
        text: ''
      },
      labels: {
        enabled: false
      }
    };

    chartData.plotOptions = {
      series: {
        pointWidth: 1
      }
    };

    const element = angular.element(`#${ctrl.verticalBarChartId}`);
    element.highcharts(chartData);

    ctrl.highcharts = element.highcharts();
  };

  const init = () => {
    const uniqueId = new Date().getTime();
    ctrl.verticalBarChartId = `vertical_bar_chart_${uniqueId}`;

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

resellersModule.controller('verticalBarChartController', verticalBarChartController);
export default verticalBarChartController;
