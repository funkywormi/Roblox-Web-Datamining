import { GroupVideosService } from 'Roblox';
import groupModule from '../groupModule';

function groupReactVideos() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      groupId: '<',
      videosData: '<'
    },
    link(scope, element) {
      const renderVideos = () => {
        GroupVideosService?.renderVideosSection(element[0], {
          groupId: scope.groupId,
          videosData: scope.videosData
        });
      };

      element.ready(renderVideos);

      ['groupId', 'videosData'].forEach(prop => {
        scope.$watch(
          prop,
          (newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              renderVideos();
            }
          },
          true
        );
      });
    }
  };
}

groupModule.directive('groupReactVideos', groupReactVideos);

export default groupReactVideos;
