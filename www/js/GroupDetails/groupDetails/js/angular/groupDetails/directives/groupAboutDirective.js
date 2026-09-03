import groupModule from '../groupModule';
import { sendHomepageScrollExposure } from '../../../../ts/react/shared/userActivity/groupPageEventStream';

// Ignore sub-pixel / rubber-band jitter.
const SCROLL_THRESHOLD_PX = 4;

function groupAbout(groupResources) {
  'ngInject';

  return {
    restrict: 'A',
    templateUrl: groupResources.templates.groupAboutTemplate
  };
}

// Logs one scroll exposure the first time the user scrolls the community page
// (any tab). Attach to the group-page shell (groupBase.html) so it survives tab
// switches and re-arms per visit. One-shot passive window listener, removed on
// fire or destroy.
function groupPageScrollTracker() {
  return {
    restrict: 'A',
    link(scope) {
      let hasFired = false;
      const onScroll = () => {
        if (hasFired) {
          return;
        }
        const scrollY = window.scrollY || window.pageYOffset || 0;
        if (scrollY <= SCROLL_THRESHOLD_PX) {
          return;
        }
        hasFired = true;
        sendHomepageScrollExposure();
        window.removeEventListener('scroll', onScroll);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      scope.$on('$destroy', () => {
        window.removeEventListener('scroll', onScroll);
      });
    }
  };
}

groupModule.directive('groupAbout', groupAbout);
groupModule.directive('groupPageScrollTracker', groupPageScrollTracker);

export default groupAbout;
