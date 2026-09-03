import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import constants from '../../../ts/shared/constants';
const { isEligibleForUpsell } = constants;

// import main module definition.
import avatarUpsellModule from './avatarUpsellModule';

// import main scss file
import '../../../css/avatarUpsell/avatarUpsell.scss';

importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);
const templates = templateCacheGenerator(angular, 'avatarUpsellAppTemplates', templateContext);

const webAppContainer = document.getElementById('upsell-container') || document.getElementById('avatar-web-app');
if (isEligibleForUpsell) {
  // manual bootstraping of our module.
  angular.element(() => {
    webAppContainer.classList.add('upsell-container', 'rbx-is-upsell');
    webAppContainer.setAttribute('avatar-upsell-base', '');
    // class hooked via CSS
    document.body.classList.add('avatar-upsell');
    angular.bootstrap(webAppContainer, [avatarUpsellModule.name, templates.name]);
  });

  // shim avatar in global.
  window.avatarUpsell = avatarUpsellModule;
}

export default avatarUpsellModule;
