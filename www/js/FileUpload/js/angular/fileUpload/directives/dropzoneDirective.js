import fileUploadModule from "../fileUploadModule";

function dropzone(fileUploadConstants) {
    "ngInject";
    var onDragOverClass = "dragover";

    return {
        scope: {
            onFileChange: "="
        },
        link: function (scope, elem, attrs) {
            function onDragOverOrEnter(event) {
                event.preventDefault();
                var originalEvent = event && event.originalEvent;
                if (originalEvent) {
                    if (event.dataTransfer) {
                        // Calling setData is necessary for firefox drag and drop to work
                        // If you use originalEvent, this will throw an error
                        event.dataTransfer.setData('text', 'anything');
                        originalEvent.dataTransfer.effectAllowed = fileUploadConstants.effectTypes.copy;
                    }
                    elem.addClass(onDragOverClass);
                }
                return false;
            }

            function onDragLeave(event) {
                elem.removeClass(onDragOverClass);
            }

            function onDrop(event) {
                event.preventDefault();
                scope.onFileChange(event);
                elem.removeClass(onDragOverClass);
            }

            elem.on("drop", onDrop);
            elem.on("dragover", onDragOverOrEnter);
            elem.on("dragenter", onDragOverOrEnter);
            elem.on("dragleave", onDragLeave);
        }
    };
};

fileUploadModule.directive("dropzone", dropzone);
export default dropzone;
