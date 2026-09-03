import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import groupListModule from "../groupListModule";

function groupsListItemController(thumbnailConstants) {
    "ngInject";

    var ctrl = this;

    var init = function () {
        ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
        ctrl.thumbnailOptions = {
            isLazyLoading: true
        }

        try {
        initRobloxBadgesFrameworkAgnostic({
            overrideIconClass: 'verified-badge-icon-group-showcase-grid'
        });
        } catch (e) {
            // noop
        }
    };

    ctrl.$onInit = init;
}

groupListModule.controller("groupsListItemController", groupsListItemController);
export default groupsListItemController;