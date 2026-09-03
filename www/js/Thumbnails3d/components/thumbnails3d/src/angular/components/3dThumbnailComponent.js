import thumbnails3dModule from "../thumbnails3dModule";

const thumbnail3d = {
  templateUrl: "3d-thumbnail",
  bindings: {
    targetId: "<",
    retry: "<",
    retryInterval: "<",
    onSuccess: "<",
    onFailure: "<",
  },
  controller: "3dThumbnailController",
};

thumbnails3dModule.component("thumbnail3d", thumbnail3d);

export default thumbnail3d;
