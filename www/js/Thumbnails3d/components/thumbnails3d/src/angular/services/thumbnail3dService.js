import { loadObjAndMtl3D } from "@rbx/thumbnail3d";
import { getThumbnail3dJson } from "../../services/thumbnail3d";

import thumbnails3dModule from "../thumbnails3dModule";

function thumbnail3dService($q) {
  "ngInject";

  const getThumbnail3dCanvas = (targetId, container, useDynamicLighting) =>
    $q((resolve, reject) => {
      getThumbnail3dJson(targetId)
        .then(({ json, performance }) => {
          loadObjAndMtl3D(container, json, useDynamicLighting).then(([canvas]) =>
            resolve({ canvas, performance }),
          );
        })
        .catch(reject);
    });
  return {
    getThumbnail3dCanvas,
  };
}

thumbnails3dModule.factory("thumbnail3dService", thumbnail3dService);

export default thumbnail3dService;
