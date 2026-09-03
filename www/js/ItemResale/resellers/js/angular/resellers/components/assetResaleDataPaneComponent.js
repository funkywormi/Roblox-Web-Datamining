import resellersModule from '../resellersModule.js';

const assetResaleDataPaneComponent = {
  templateUrl: 'asset-resale-data-pane',
  bindings: {
    resaleData: '<',
    isLimited2: '<'
  },
  controller: 'assetResaleDataPaneController'
};

resellersModule.component('assetResaleDataPane', assetResaleDataPaneComponent);
export default assetResaleDataPaneComponent;
