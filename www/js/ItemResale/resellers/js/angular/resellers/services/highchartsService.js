import resellersModule from '../resellersModule.js';

function highchartsService(resellersConstants, $timeout, $q) {
  'ngInject';

  const toHighChartsData = dataPoints => {
    return dataPoints
      .reverse()
      .map(dataPoint => {
        const date = new Date(dataPoint.date);
        return date.getTime() + resellersConstants.highCharts.itemDelimiter + dataPoint.value;
      })
      .join(resellersConstants.highCharts.lineDelimiter);
  };

  return {
    getDateMinusDays(days) {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d.getTime();
    },

    toHighChartsData(dataPoints) {
      return {
        csv: `col${resellersConstants.highCharts.itemDelimiter}row${
          resellersConstants.highCharts.lineDelimiter
        }${toHighChartsData(dataPoints)}${resellersConstants.highCharts.lineDelimiter}`,
        itemDelimiter: resellersConstants.highCharts.itemDelimiter,
        lineDelimiter: resellersConstants.highCharts.lineDelimiter
      };
    }
  };
}

resellersModule.factory('highchartsService', highchartsService);
export default highchartsService;
