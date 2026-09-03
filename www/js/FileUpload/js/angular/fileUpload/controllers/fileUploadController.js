import fileUploadModule from "../fileUploadModule";
import { DeviceMeta } from "Roblox";

function fileUploadController($scope, fileUploadConstants, languageResource, systemFeedbackService, thumbnailConstants, thumbnailService) {
    "ngInject";
    var ctrl = this;

    ctrl.getCssClasses = function () {
        return thumbnailService.getCssClass(ctrl.thumbnailState);
    };

    function isValidFileType(file) {
        // If no file was specified, it's not allowed
        if (!file || !file.name || !file.name.length === 0) {
            return false;
        }

        // If no file types are specified, all are allowed
        const { fileUploadInfo: {allowedFileTypes}} = ctrl;
        if (!allowedFileTypes || allowedFileTypes.length === 0) {
            return true;
        }

        const fileType = "." + file.name.split('.').pop().toLowerCase();
        return allowedFileTypes.includes(fileType);
    };

    function maxFileSizeInMegabytes() {
        return ctrl.fileUploadInfo.maxFileSizeInMegabytes || fileUploadConstants.defaultMaxFileSizeInMegabytes;
    };

    function isValidFileSize(file) {       
        const fileSizeInBytes = file.size;
        const maxFileSizeInBytes = maxFileSizeInMegabytes() * 1000 * 1000;
        return fileSizeInBytes <= maxFileSizeInBytes;
    };

    ctrl.allowedFileTypesString = function () {
        const { fileUploadInfo: {allowedFileTypes}} = ctrl;
        if (!allowedFileTypes) {
            return "";
        }

        if (allowedFileTypes.length === 1) {
            return allowedFileTypes[0];
        }
        return allowedFileTypes.join(", ");
    };

    ctrl.onFileChange = function (event) {
        var file = ctrl.fileModel[0];
        if (event) {
            if (event.type === fileUploadConstants.eventTypes.drop) {
                event.preventDefault();
                file = event.originalEvent.dataTransfer.files[0];
            }
            else {
                file = event.target.file[0];
            }
            // Make sure to invalidate a potential fileModel set by uploading with the button, not drag and drop
            ctrl.fileModel = [];
        }

        if (file) {
            if (!isValidFileType(file)) {
                systemFeedbackService.warning(languageResource.get("Message.InvalidFile", { fileTypes: ctrl.allowedFileTypesString() }));
                ctrl.fileModel = [];
            } else if (!isValidFileSize(file)) {
                systemFeedbackService.warning(languageResource.get("Message.InvalidFileSize", { fileSize: maxFileSizeInMegabytes() }));
                ctrl.fileModel = [];
            } else {
                var fileReader = new FileReader();
                fileReader.onload = function (e) {
                    $scope.$apply(function () {
                        ctrl.fileUploadInfo.previewSrc = e.target.result;
                        ctrl.fileUploadInfo.fileSelected = true;
                        ctrl.fileUploadInfo.file = file;
                        ctrl.thumbnailState = "";
                    });
                };

                fileReader.readAsDataURL(file);
            }
        }
    };

    var init = function () {
        ctrl.fileModel = [];
        if (DeviceMeta && !DeviceMeta().isDesktop) {
            ctrl.fileUploadInfo.mobileDevice = true;
        }
    };

    ctrl.$onInit = init;
};

fileUploadModule.controller("fileUploadController", fileUploadController);

export default fileUploadController;
