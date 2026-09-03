import createGroupModule from "../createGroupModule.js";

const createGroupConfirmationModal = {
    templateUrl: "create-group-confirmation-modal",
    bindings: {
        "close": "&", // Confirm
        "dismiss": "&", // Cancel
        "resolve": "<"
    },
    controller: "createGroupConfirmationModalController"
};

createGroupModule.component("createGroupConfirmationModal", createGroupConfirmationModal);

export default createGroupConfirmationModal;