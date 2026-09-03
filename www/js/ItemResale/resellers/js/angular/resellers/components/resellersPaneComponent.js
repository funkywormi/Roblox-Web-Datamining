import resellersModule from '../resellersModule.js';

const resellersPaneComponent = {
  templateUrl: 'resellers-pane',
  bindings: {
    resaleData: '<',
    assetData: '<',
    economyMetadata: '<',
    isLimited2: '<',
    resaleRestriction: '<',
    itemType: '<'
  },
  controller: 'resellersPaneController'
};

resellersModule.component('resellersPane', resellersPaneComponent);
export default resellersPaneComponent;
