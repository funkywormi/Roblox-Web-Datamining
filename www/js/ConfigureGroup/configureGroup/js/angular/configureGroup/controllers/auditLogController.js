import configureGroupModule from '../configureGroupModule';

function auditLogController(
  $scope,
  $log,
  $filter,
  thumbnailConstants,
  configureGroupConstants,
  groupsService,
  auditLogService,
  translationService,
  languageResource,
  cursorPaginationService,
  keyCode
) {
  'ngInject';

  const ctrl = this;

  ctrl.filterType = function (auditLogTypeKey, auditLogTypeValue) {
    ctrl.query.action = auditLogTypeValue;
    $scope.pager.setPagingParameter('actionType', auditLogTypeKey);
    $scope.pager.loadFirstPage();
  };

  ctrl.filterKeyword = function () {
    groupsService.getUserIdsFromUsernames([ctrl.query.keyword]).then(function (users) {
      if (users.length > 0) {
        $scope.pager.setPagingParameter('userid', users[0].id);
      } else {
        $scope.pager.setPagingParameter('userid', '');
      }
      $scope.pager.loadFirstPage();
    });
  };

  ctrl.getTranslations = function () {
    const { displayGroupBans } = ctrl.policies;

    translationService.getTextResources().then(
      function (resources) {
        if (!displayGroupBans) {
          delete resources.banMember;
          delete resources.unbanMember;
        }

        // Convert object to array and sort in-place using locale-aware comparison
        ctrl.translationResources = Object.entries(resources)
          .map(([key, value]) => ({ key, value }))
          .sort((a, b) => {
            // The 'all' option should come first
            if (a.key === 'all') return -1;
            if (b.key === 'all') return 1;
            // Otherwise, sort by value using locale-aware comparison
            return languageResource.intl.langSensitiveCompare(a.value, b.value);
          });
      },
      function () {
        // This should never happen because the implementation only resolves right now.
        $log.debug('Failed to load text resources.');
      }
    );
  };

  ctrl.loadConfigureGroupPolicies = function () {
    if (ctrl.policies.length > 0) {
      return Promise.resolve();
    }

    return groupsService.getConfigureGroupRules().then(
      response => {
        ctrl.policies = response;
      },
      () => {
        $log.debug('--loadConfigureGroupPolicies-error---');
      }
    );
  };

  $scope.pager = cursorPaginationService.createPager({
    pageSize: configureGroupConstants.pageSize,
    loadPageSize: configureGroupConstants.loadPageSize,
    sortOrder: cursorPaginationService.sortOrder.Desc,

    getCacheKeyParameters(params) {
      return {
        actionType: params.actionType
      };
    },

    getRequestUrl() {
      return $filter('formatString')(configureGroupConstants.urls.getAuditLogUrl, {
        groupId: ctrl.groupId
      });
    },

    loadSuccess(logs) {
      logs.forEach(function (item, index) {
        const newDescription = auditLogService.formatDescription(item, ctrl.policies);
        logs[index].formattedDescription = newDescription;
      });
      ctrl.logs = logs;
    },

    loadError(errors) {
      ctrl.logs = [];
      if (errors && errors.length > 0) {
        ctrl.loadError = errors[0].message;
      } else {
        ctrl.loadError = languageResource.get('Message.LoadTransactionsError');
      }
    }
  });

  const init = function () {
    ctrl.logs = [];
    ctrl.policies = {};
    ctrl.query = {
      keyword: '',
      action: languageResource.get('Label.All')
    };
    ctrl.keyCodes = keyCode;
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    ctrl.loadConfigureGroupPolicies().then(ctrl.getTranslations);
    $scope.pager.loadFirstPage();
  };

  ctrl.$onInit = init;
}

configureGroupModule.controller('auditLogController', auditLogController);

export default auditLogController;
