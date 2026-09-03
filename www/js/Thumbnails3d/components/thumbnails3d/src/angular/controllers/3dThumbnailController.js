import thumbnails3dModule from "../thumbnails3dModule";

function threeDThumbnailController($scope) {
  "ngInject";

  // TODO: old, migrated code.
  // eslint-disable-next-line no-invalid-this
  const ctrl = this;
  // TODO: old, migrated code.
  // eslint-disable-next-line no-param-reassign
  $scope.isLoading = false;
  ctrl.setLoading = state => {
    // TODO: old, migrated code.
    // eslint-disable-next-line no-param-reassign
    $scope.isLoading = state;
  };
}

thumbnails3dModule.controller("3dThumbnailController", threeDThumbnailController);

export default threeDThumbnailController;
