import groupModule from "../groupModule";
import { EventStream } from 'Roblox';

function groupGamesItemController(thumbnailConstants) {
    "ngInject";

    var ctrl = this;

    ctrl.goToGameDetails = function ($event) {
        if (EventStream && EventStream.SendEvent) {
            const payload = {
                communityId: parseInt(window.location.href.match(/\/(?:groups|communities|profiles)\/(\d+)\//)?.[1] ?? '0', 10),
                affiliationType: 'owner',
                placeId: ctrl.game.rootPlace.id,
                universeId: ctrl.game.id,
            };
            EventStream.SendEvent('communityAffiliatedExperienceClick', 'communityProfile', payload);
        }
    };

    var init = function () {
        ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    };

    ctrl.$onInit = init;
}

groupModule.controller("groupGamesItemController", groupGamesItemController);
export default groupGamesItemController;
