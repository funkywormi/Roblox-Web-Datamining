import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/playerSearch/playerSearch.scss';

// import main module definition.
import playerSearchModule from './playerSearchModule';

importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));

const playerSearchTemplateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(
  angular,
  'playerSearchAppTemplates',
  playerSearchTemplateContext
);

// self manual initialization
angular.element(() => {
  const webAppContainer = document.getElementById('player-search-web-app') || document.getElementById('player-search-container');
  webAppContainer.classList.add('player-search-container');

  const bootstrapContainer = webAppContainer.querySelector('div') || document.createElement('div');
  bootstrapContainer.setAttribute('player-search-base', '');
  webAppContainer.appendChild(bootstrapContainer);
  angular.bootstrap(`#${webAppContainer.id}`, [playerSearchModule.name, templates.name]);
});
