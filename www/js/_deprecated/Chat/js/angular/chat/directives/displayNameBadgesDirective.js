import chatModule from '../chatModule';

/**
 * SUBS-5048: renders the Roblox Plus identity badge next to a chat user's
 * displayName (DM list cell, conversation title). Gated on the GUAC
 * `web-plus-identity-badge` bundle (`plusIdentityBadgeEnabled` field) so
 * legacy chat and the workspace `useIsPlusBadgeEnabled` hook flip
 * together.
 *
 * Plus is the only identity badge currently surfaced in chat. The
 * workspace `<DisplayNameBadges />` also handles verified / premium /
 * admin, but chat has no upstream data for those signals
 * (platform-chat-api `user_data` only carries name/displayName), so this
 * directive is intentionally Plus-only. Add new badges here when a
 * future phase wires data for them.
 */
function displayNameBadges(resources, guacService) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: {
      isRobloxPlus: '=?'
    },
    templateUrl: resources.templates.displayNameBadgesTemplate,
    link: function (scope) {
      scope.isPlusBadgeEnabled = false;
      guacService.getPlusIdentityBadgePolicies().then(
        function (result) {
          scope.isPlusBadgeEnabled = result && result.plusIdentityBadgeEnabled === true;
        },
        function () {
          scope.isPlusBadgeEnabled = false;
        }
      );
      scope.shouldShowPlus = function () {
        return scope.isPlusBadgeEnabled && scope.isRobloxPlus === true;
      };
    }
  };
}

chatModule.directive('displayNameBadges', displayNameBadges);

export default displayNameBadges;
