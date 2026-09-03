import fileUploadModule from "../fileUploadModule";

// Enable file selection bound to ng-model
// https://stackoverflow.com/a/43074638/1663648
function enableFileSelection() {
    "ngInject";

    return {
        scope: {
            onFileChange: "="
        },
        require: "ngModel",
        link: function (scope, elem, attrs, ngModel) {
            ngModel.$setViewValue(elem[0].files); // Set initial value.

            elem.on("change", function (event) {
                ngModel.$setViewValue(elem[0].files);
                if (typeof scope.onFileChange === 'function') {
                    scope.onFileChange();
                }
            });
        }
    };
};

fileUploadModule.directive("enableFileSelection", enableFileSelection);
export default enableFileSelection;