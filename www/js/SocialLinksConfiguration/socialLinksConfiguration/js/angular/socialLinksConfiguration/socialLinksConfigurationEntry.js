import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/socialLinksConfiguration.scss';

importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));

const templateContext = require.context('./components/templates/', true, /\.html$/);

const templates = templateCacheGenerator(
  angular,
  'socialLinksConfigurationHtmlTemplateApp',
  null,
  templateContext
);

export default templates;
