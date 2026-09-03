import * as thumbnail2dService from "../../services/thumbnail2d";
import thumbnailsModule from "../thumbnailsModule";

function thumbnailService($q) {
  "ngInject";

  const getThumbnailImage = (thumbnailType, targetId, size, format, includeProfileFrame) =>
    $q((resolve, reject) => {
      thumbnail2dService
        .getThumbnailImage(
          thumbnailType,
          size,
          format,
          targetId,
          undefined,
          undefined,
          undefined,
          undefined,
          includeProfileFrame,
        )
        .then(image => {
          resolve(image);
        })
        .catch(reject);
    });

  const reloadThumbnailImage = (thumbnailType, targetId, size) =>
    $q((resolve, reject) => {
      thumbnail2dService
        .reloadThumbnailImage(thumbnailType, size, null, targetId)
        .then(image => {
          resolve(image);
        })
        .catch(reject);
    });

  const getCssClass = thumbnailState => thumbnail2dService.getCssClass(thumbnailState);

  return {
    getThumbnailImage,
    getCssClass,
    reloadThumbnailImage,
  };
}

thumbnailsModule.factory("thumbnailService", thumbnailService);

export default thumbnailService;
