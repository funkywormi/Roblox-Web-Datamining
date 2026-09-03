import fileUploadModule from "../fileUploadModule";

const fileUploadConstants = {
    effectTypes: {
        copy: "copy"
    },
    eventTypes: {
        drop: "drop"
    },
    // This is the default IIS limit
    // Consumers may override this to allow larger files
    defaultMaxFileSizeInMegabytes: 4
};

fileUploadModule.constant("fileUploadConstants", fileUploadConstants);
export default fileUploadConstants;
