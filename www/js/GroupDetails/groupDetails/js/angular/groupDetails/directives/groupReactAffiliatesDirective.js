
import Roblox from 'Roblox';
import groupModule from '../groupModule';

function groupReactAffiliates() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      groupId: '<',
      areEnemiesAllowed: '<'
    },
    link(scope, element) {
      const renderAffiliates = () => {
        const { GroupAffiliatesService } = Roblox;
        if (scope.groupId) {
          GroupAffiliatesService?.renderGroupAffiliates(element[0], {
            groupId: scope.groupId,
            areEnemiesAllowed: scope.areEnemiesAllowed
          });
        }
      };

      element.ready(renderAffiliates);

      ['groupId', 'areEnemiesAllowed'].forEach(prop => {
        scope.$watch(
          prop,
          (newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              renderAffiliates();
            }
          },
          true
        );
      });
    }
  };
}

groupModule.directive('groupReactAffiliates', groupReactAffiliates);

export default groupReactAffiliates;
