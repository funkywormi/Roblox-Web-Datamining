import { GroupExperiencesService } from 'Roblox';
import groupModule from '../groupModule';

function groupPublicServers() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      groupId: '<'
    },
    link(scope, element) {
      const renderPublicServers = () => {
        if (!scope.groupId) {
          return;
        }

        GroupExperiencesService?.renderGroupPublicServers(element[0], {
          groupId: scope.groupId
        });
      };

      element.ready(renderPublicServers);

      scope.$watch(
        'groupId',
        (newVal, oldVal) => {
          if (newVal !== oldVal) {
            renderPublicServers();
          }
        },
        false
      );
    }
  };
}

groupModule.directive('groupPublicServers', groupPublicServers);

export default groupPublicServers;
