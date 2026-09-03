import { Linkify } from 'Roblox';
import profileAboutModule from '../profileAboutModule';

function linkify() {
  'ngInject';

  return function (input) {
    if (typeof input !== 'string') {
      return input;
    }
    if (angular.isDefined(Linkify) && typeof Linkify.String === 'function') {
      return Linkify.String(input.escapeHTML());
    }
    return input.escapeHTML();
  };
}

profileAboutModule.filter('linkify', linkify);
export default linkify;
