import angular from 'angular';
import { importFilesUnderPath } from 'roblox-es6-migration-helper';
import { authenticatedUser } from 'header-scripts';

import '../../../css/forgotCredentials/forgotCredentials.scss';
import '../../../css/forgotCredentials/securityNotification.scss';

// import main module definition.
import forgotCredentialsModule from './forgotCredentialsModule';

// Don't bootstrap angular and just redirect to home if U13
if (authenticatedUser && authenticatedUser.isUnder13) {
  window.location.href = `${Roblox.EnvironmentUrls.websiteUrl}/home`;
}

importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));

// self manual initialization
const containerElement =
  document.getElementById('forgot-credentials-container') ||
  document.getElementById('forgot-credentials-web-app');
containerElement.setAttribute('forgot-credentials', '');

angular.element(function () {
  angular.bootstrap(containerElement, [forgotCredentialsModule.name]);
});

export default forgotCredentialsModule;
