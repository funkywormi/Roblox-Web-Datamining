import { Linkify } from 'Roblox';
import groupModule from '../groupModule';

function linkify() {
    "ngInject";

    return function (input) {
        if (typeof input !== "string") {
            return input;
        }
        if (angular.isDefined(Linkify) && typeof Linkify.String === "function") {
            return Linkify.String(input.escapeHTML());
        }
        return input.escapeHTML();
    };
};

groupModule.filter("linkify", linkify);
export default linkify;