import thumbnails3dModule from "../thumbnails3dModule";

function canvasContainer(thumbnail3dService) {
  "ngInject";

  return {
    link(scope, elem) {
      const ctrl = scope.$ctrl;
      ctrl.setLoading(true);
      thumbnail3dService
        .getThumbnail3dCanvas(ctrl.targetId, elem.context.parentElement)
        .then(({ canvas, performance }) => {
          ctrl.setLoading(false);
          elem.append(canvas);
          if (ctrl.onSuccess) {
            ctrl.onSuccess(performance);
          }
        })
        .catch(error => {
          if (ctrl.onFailure) {
            ctrl.onFailure(error);
          }
        });
    },
  };
}

thumbnails3dModule.directive("canvasContainer", canvasContainer);
