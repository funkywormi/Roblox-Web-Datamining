import createGroupModule from '../createGroupModule';

function enableFileSelection() {
    "ngInject";
    return {
        require: "ngModel",
        link: function (scope, elem, attrs, ngModel) {
            ngModel.$setViewValue(elem[0].files); // Set initial value.

            elem.on("change", function (e) {
                ngModel.$setViewValue(elem[0].files);
            });
        }
    };
}

createGroupModule.directive("enableFileSelection", enableFileSelection);

export default enableFileSelection;