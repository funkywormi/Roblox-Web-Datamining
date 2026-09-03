import playerSearchModule from '../playerSearchModule';

function playerSearchBase(playerSearchConstants) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: playerSearchConstants.templates.playerSearchBase
  };
}

playerSearchModule.directive('playerSearchBase', playerSearchBase);

export default playerSearchBase;
