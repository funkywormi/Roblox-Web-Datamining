import groupModule from '../groupModule';

function groupBase($rootScope, captchaV2Constants, groupResources) {
    "ngInject";

    return {
        restrict: "A",
        templateUrl: groupResources.templates.groupBaseTemplate,
        link: function (scope, elements, params) {
            $rootScope.captchaActionTypes = captchaV2Constants.captchaActionTypes;
            $rootScope.captcha = {
                activated: false
            };
        }
    }
};

groupModule.directive("groupBase", groupBase);

export default groupBase;