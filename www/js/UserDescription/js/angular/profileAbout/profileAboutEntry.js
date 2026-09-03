import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

// import main module definition.
import profileAboutModule from './profileAboutModule';

import '../../../css/userDescription/userDescription.scss';

// import all other js files for avatarModule
importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./filters/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);
const templates = templateCacheGenerator(angular, 'profileAboutAppTemplates', templateContext);

angular.element(() => {
  angular.bootstrap('#profile-about-container:not([ng-modules])', [
    profileAboutModule.name,
    templates.name
  ]);
});

export default profileAboutModule;
