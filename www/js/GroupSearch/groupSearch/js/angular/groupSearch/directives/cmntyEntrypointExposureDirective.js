import groupSearchModule from '../groupSearchModule';

/**
 * Fire-once per-card exposure for community entry points (GRPS-3060).
 *
 * Usage (inside an ng-repeat): the attribute expression is evaluated exactly once, the first time
 * the element scrolls into view. The expression is expected to invoke a logging function, e.g.
 *
 *   <group-result-card cmnty-entrypoint-exposure="$ctrl.handleResultExposure(group, $index)">
 *
 * Angular equivalent of the React `EntrypointExposure` component. Falls back to firing immediately
 * when IntersectionObserver is unavailable so exposures are never silently dropped.
 */
function cmntyEntrypointExposure() {
  'ngInject';

  return {
    restrict: 'A',
    link(scope, element, attrs) {
      let hasLoggedExposure = false;

      const fire = () => {
        if (hasLoggedExposure) {
          return;
        }
        hasLoggedExposure = true;
        scope.$evalAsync(attrs.cmntyEntrypointExposure);
      };

      if (typeof IntersectionObserver === 'undefined') {
        fire();
        return;
      }

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              fire();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(element[0]);
      scope.$on('$destroy', () => observer.disconnect());
    }
  };
}

groupSearchModule.directive('cmntyEntrypointExposure', cmntyEntrypointExposure);

export default cmntyEntrypointExposure;
