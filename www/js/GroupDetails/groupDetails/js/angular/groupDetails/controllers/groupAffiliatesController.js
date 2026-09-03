import groupModule from '../groupModule';

function groupAffiliatesController(
    $scope,
    $filter,
    groupsConstants,
    groupDetailsConstants,
    cursorPaginationService,
    $q,
    $log,
    thumbnailConstants
) {
    'ngInject';

    const ctrl = this;

    const init = () => {
        ctrl.isInitialized = true;
        ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;

        $scope.affiliatesPager.loadFirstPage();
    };

    $scope.affiliatesPager = cursorPaginationService.createPager({
        cursorName: 'startRowIndex',
        limitName: 'maxRows',
        firstPageCursor: '0',

        pageSize: groupDetailsConstants.affiliatesPageSize,
        loadPageSize: groupDetailsConstants.cursorPageLoadSize,

        getCacheKeyParameters() {
            return {
                groupId: ctrl.groupId,
                groupRelationshipType: ctrl.relationshipType
            };
        },

        getRequestUrl() {
            return $filter('formatString')(groupsConstants.urls.getGroupRelationships, {
                groupId: ctrl.groupId,
                groupRelationshipType: ctrl.relationshipType
            });
        },

        getNextPageCursorFromResponse(response) {
            if (!response.nextRowIndex || response.totalGroupCount <= response.nextRowIndex) {
                return null;
            }

            return response.nextRowIndex.toString();
        },

        getDataListFromResponse(response) {
            return $q(function (resolve, reject) {
                resolve(response.relatedGroups);
            });
        },

        loadSuccess(groups) {
            ctrl.affiliates = groups;
        },

        loadError(errors) {
            ctrl.affiliates = [];
            ctrl.loadAffiliatesError = true;
            $log.debug(' ------ getGroupRelationships error -------');
        }
    });

    const onChanges = changesObj => {
        // If we haven't initialized this yet, return
        if (!ctrl.isInitialized) {
            return;
        }

        if ('groupId' in changesObj) {
            $scope.affiliatesPager.loadFirstPage();
        }
    };

    ctrl.$onInit = init;
    ctrl.$onChanges = onChanges;
}

groupModule.controller('groupAffiliatesController', groupAffiliatesController);
export default groupAffiliatesController;