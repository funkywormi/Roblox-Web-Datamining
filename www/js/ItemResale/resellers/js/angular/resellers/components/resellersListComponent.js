import resellersModule from '../resellersModule.js';

const resellersListComponent = {
  templateUrl: 'resellers-list',
  bindings: {
    resaleData: '<',
    assetData: '<',
    resaleRecords: '<',
    resellerTradePermissions: '<',
    showResellerTradeButton: '<',
    isLimited2: '<',
    itemType: '<'
  },
  controller: 'resellersListController'
};

resellersModule.component('resellersList', resellersListComponent);
export default resellersListComponent;
