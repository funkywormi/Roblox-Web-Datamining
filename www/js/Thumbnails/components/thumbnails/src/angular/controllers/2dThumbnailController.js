import { logMeasurement } from "../../metrics";
import {
  ThumbnailStates,
  DefaultThumbnailSize,
  DefaultThumbnailFormat,
} from "../../constants/thumbnail2dConstant";
import thumbnailsModule from "../thumbnailsModule";

// eslint-disable-next-line no-unused-vars
function twoDThumbnailController($scope, thumbnailService) {
  "ngInject";

  // TODO: old, migrated code
  // eslint-disable-next-line no-invalid-this
  const ctrl = this;
  let lastThumbnail = "";
  const thumbnailStates = ThumbnailStates;

  ctrl.getCssClasses = () => {
    if (ctrl.isThumbnailRequestSending) {
      return "shimmer";
    }
    return thumbnailService.getCssClass(ctrl.thumbnailState);
  };

  ctrl.setThumbnailLoadFailed = function () {
    // TODO: Get design approval
    // ctrl.thumbnailState = thumbnailStates.error;
    // ctrl.thumbnailUrl = null;
    // $scope.$digest();
  };

  ctrl.isLazyLoadingEnabled = function () {
    return ctrl.thumbnailOptions && ctrl.thumbnailOptions.isLazyLoading;
  };

  ctrl.updateImageLoadMetrics = function (finishTime) {
    const duration = finishTime - ctrl.startTime;
    const { retryAttempts } = ctrl.performance;

    logMeasurement("ThumbnailLoadDurationWebapp", {
      Status: "Success",
      ThumbnailType: `${ctrl.thumbnailType}_2d`,
      Version: ctrl.version,
      Value: duration.toString(),
    });
    if (!retryAttempts) {
      // load success without retry
      logMeasurement("ThumbnailNoRetrySuccessWebapp", {
        ThumbnailType: `${ctrl.thumbnailType}_2d`,
        Version: ctrl.version,
      }).catch(e => {
        console.error(e);
      });
    } else {
      // log retry attempts by type
      logMeasurement("ThumbnailRetryWebapp", {
        ThumbnailType: `${ctrl.thumbnailType}_2d`,
        Version: ctrl.version,
        Value: retryAttempts.toString(),
      }).catch(e => {
        console.error(e);
      });
    }
  };

  const init = function () {
    const debounceKey = `${ctrl.thumbnailType}:${ctrl.thumbnailTargetId}`;
    ctrl.startTime = new Date().getTime();

    if (lastThumbnail === debounceKey) {
      return;
    }

    lastThumbnail = debounceKey;
    ctrl.thumbnailState = thumbnailStates.loading;

    const thumbnailSize = ctrl.thumbnailOptions?.size || DefaultThumbnailSize;
    const thumbnailFormat = ctrl.thumbnailOptions?.format || DefaultThumbnailFormat;
    const includeProfileFrame = ctrl.thumbnailOptions?.includeProfileFrame;
    ctrl.isThumbnailRequestSending = true;
    thumbnailService
      .getThumbnailImage(
        ctrl.thumbnailType,
        ctrl.thumbnailTargetId,
        thumbnailSize,
        thumbnailFormat,
        includeProfileFrame,
      )
      .then(({ thumbnail: { state, imageUrl, version }, performance }) => {
        ctrl.thumbnailState = state;
        ctrl.thumbnailUrl = imageUrl;
        ctrl.performance = performance;
        ctrl.version = version;
        if (ctrl.onSuccess) {
          ctrl.onSuccess(performance);
        }
      })
      .catch(error => {
        ctrl.thumbnailState = thumbnailStates.error;
        if (ctrl.onFailure) {
          ctrl.onFailure(error);
        }
      })
      .finally(() => {
        ctrl.isThumbnailRequestSending = false;
      });
  };
  ctrl.$onInit = init;
  ctrl.$onChanges = init;
}

thumbnailsModule.controller("2dThumbnailController", twoDThumbnailController);

export default twoDThumbnailController;
