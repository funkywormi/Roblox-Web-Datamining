import fileUploadModule from "../fileUploadModule";

function imagePreview() {
    "ngInject";

    return {
        link: function (scope, elem, attrs) {
            elem.on("load", function (e) {
                // Clear other scaling classes in case they were added
                elem.removeClass("scale-height");
                elem.removeClass("scale-width");

                var img = elem[0];
                var wrapper = img.parentElement;

                var clientHeight = wrapper.clientHeight;
                var clientWidth = wrapper.clientWidth;

                var naturalHeight = img.naturalHeight;
                var naturalWidth = img.naturalWidth;

                if (naturalHeight < clientHeight && naturalWidth < clientWidth) {
                    var scaleCssClass = naturalHeight > naturalWidth ? "scale-height" : "scale-width";
                    elem.addClass(scaleCssClass);
                }
            });
        }
    };
};

fileUploadModule.directive("imagePreview", imagePreview);
export default imagePreview;