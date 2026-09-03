import groupPayoutsModule from "../groupPayoutsModule.js";

const configureGroupOneTimePayout = {
    templateUrl: "configure-group-one-time-payout",
    bindings: {
        "groupId": "<",
        "groupFunds": "<",
        "reloadGroupFunds": "="
    },
    controller: "configureGroupOneTimePayoutController"
};

groupPayoutsModule.component("configureGroupOneTimePayout", configureGroupOneTimePayout);

export default configureGroupOneTimePayout;