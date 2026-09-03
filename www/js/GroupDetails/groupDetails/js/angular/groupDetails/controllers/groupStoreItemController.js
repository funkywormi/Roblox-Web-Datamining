import groupModule from '../groupModule';

function groupStoreItemController(thumbnailConstants) {
  'ngInject';

  const ctrl = this;

  const init = () => {
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    if (ctrl.item.itemType === 'Bundle') {
      ctrl.urlPath = 'bundles';
      ctrl.thumbnailType = thumbnailConstants.thumbnailTypes.bundleThumbnail;
    } else {
      ctrl.urlPath = 'catalog';
      ctrl.thumbnailType = thumbnailConstants.thumbnailTypes.assetThumbnail;
    }
  };

  ctrl.$onInit = init;
}

groupModule.controller('groupStoreItemController', groupStoreItemController);
export default groupStoreItemController;
