import assetsExplorerModule from '../assetsExplorerModule';

const assetsExplorerComponent = {
  templateUrl: 'assets-explorer',
  bindings: {
    userId: '<',
    assetsPager: '<',
    assets: '<',
    currentData: '<',
    pageType: '<',
    showCreatorName: '<',
    categories: '<',
    canViewInventory: '<'
  },
  controller: 'assetsExplorerController'
};

assetsExplorerModule.component('assetsExplorer', assetsExplorerComponent);
export default assetsExplorerComponent;
