import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';
import GameBadgesList from '../../../ts/react/gameBadgesList/components/gameBadgesList';

import '../../../css/gameBadges.scss';

import gameBadgesModule from './gameBadgesModule';

const templateContext = require.context('./components/templates/', true, /\.html$/);
const templates = templateCacheGenerator(angular, 'gameBadgesTemplates', templateContext);

importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));

// self manual initialization
angular.element(function () {
  angular.bootstrap('#game-badges-container', [gameBadgesModule.name]);
});

export default gameBadgesModule;

window.Roblox.GameBadgesList = GameBadgesList;
