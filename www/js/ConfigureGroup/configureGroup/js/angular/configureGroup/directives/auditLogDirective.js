import Roblox from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function auditLogReact() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      groupId: '<',
      policies: '<'
    },
    link(scope, element) {
      const renderAuditLog = () => {
        const { AuditLogService } = Roblox;
        if (!AuditLogService || !scope.groupId) {
          return;
        }

        AuditLogService.renderAuditLog(element[0], {
          groupId: scope.groupId,
          policies: scope.policies
        });
      };

      element.ready(renderAuditLog);

      scope.$watch(
        () => ({
          groupId: scope.groupId,
          policies: scope.policies
        }),
        (newVal, oldVal) => {
          if (newVal.groupId && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
            renderAuditLog();
          }
        },
        true
      );
    }
  };
}

configureGroupModule.directive('auditLogReact', auditLogReact);

export default auditLogReact;
