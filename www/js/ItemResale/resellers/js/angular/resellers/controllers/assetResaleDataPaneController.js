import { numberFormat } from 'core-utilities';
import resellersModule from '../resellersModule.js';

function assetResaleDataPaneController(resellersConstants, languageResource) {
  'ngInject';

  const ctrl = this;

  ctrl.formatNumber = number => {
    if (number > 0) {
      return numberFormat.getNumberFormat(number);
    }

    return languageResource.get(resellersConstants.translationKeys.notAvailable);
  };

  ctrl.formatNumberIncludeZero = number => {
    if (number === null || number === undefined) {
      return languageResource.get(resellersConstants.translationKeys.notAvailable);
    }
    if (number >= 0) {
      return numberFormat.getNumberFormat(number);
    }

    return languageResource.get(resellersConstants.translationKeys.notAvailable);
  };

  ctrl.setSelectedResaleChartDays = dayCount => {
    ctrl.selectedResaleChartDays = dayCount;
  };

  ctrl.showResellerChart = () => {
    if (!ctrl.isLimited2) {
      return ctrl.resaleData.recentAveragePrice > 0;
    }
    return (
      ctrl.resaleData.priceDataPoints.length > 0 ||
      ctrl.resaleData.volumeDataPoints.length > 0 ||
      ctrl.resaleData.recentAveragePrice >= 0 ||
      ctrl.resaleData.originalPrice >= 0 ||
      ctrl.resaleData.sales >= 0
    );
  };

  const init = () => {
    ctrl.chartDataAvailable =
      ctrl.resaleData.priceDataPoints.length > 0 && ctrl.resaleData.volumeDataPoints.length > 0;
    ctrl.historicalDataAvailable = ctrl.showResellerChart();
    ctrl.resaleChartDayOptions = resellersConstants.resaleChartDayOptions;
    ctrl.selectedResaleChartDays =
      resellersConstants.resaleChartDayOptions[resellersConstants.resaleChartDayOptions.length - 1];
  };

  ctrl.$onInit = init;
}

resellersModule.controller('assetResaleDataPaneController', assetResaleDataPaneController);
export default assetResaleDataPaneController;
