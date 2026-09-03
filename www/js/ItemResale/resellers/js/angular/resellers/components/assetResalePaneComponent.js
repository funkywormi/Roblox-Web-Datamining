import resellersModule from '../resellersModule.js';

const assetResalePaneComponent = {
  templateUrl: 'asset-resale-pane',
  bindings: {
    assetId: '<',
    isBundle: '<'
  },
  controller: 'assetResalePaneController'
};

resellersModule.component('assetResalePane', assetResalePaneComponent);
export default assetResalePaneComponent;
