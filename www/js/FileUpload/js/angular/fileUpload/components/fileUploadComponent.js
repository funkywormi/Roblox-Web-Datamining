import fileUploadModule from "../fileUploadModule.js";

const fileUploadComponent = {
    templateUrl: "file-upload",
    bindings: {
        fileUploadInfo: "=", // allowedFileTypes, previewSrc, fileSelected, file, maxFileSizeInMegabytes
        thumbnailState: "<"
    },
    controller: "fileUploadController"
};

fileUploadModule.component("fileUpload", fileUploadComponent);
export default fileUploadComponent;