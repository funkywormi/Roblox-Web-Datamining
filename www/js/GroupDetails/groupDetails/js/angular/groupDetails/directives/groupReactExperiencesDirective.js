import { GroupExperiencesService } from 'Roblox';
import groupModule from '../groupModule';

function groupReactExperiences() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      groupId: '<'
    },
    link(scope, element) {
      const renderExperiences = () => {
        GroupExperiencesService?.renderGroupExperiences(element[0], {
          groupId: scope.groupId
        });
      };

      element.ready(renderExperiences);

      ['groupId'].forEach(prop => {
        scope.$watch(
          prop,
          (newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              renderExperiences();
            }
          },
          true
        );
      });
    }
  };
}

groupModule.directive('groupReactExperiences', groupReactExperiences);

export default groupReactExperiences;
