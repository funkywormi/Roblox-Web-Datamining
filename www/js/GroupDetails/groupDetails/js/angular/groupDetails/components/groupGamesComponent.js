import groupModule from '../groupModule';

const groupGames = {
  templateUrl: 'group-games',
  bindings: {
    groupId: '<'
  },
  controller: 'groupGamesController'
};

groupModule.component('groupGames', groupGames);

export default groupGames;
