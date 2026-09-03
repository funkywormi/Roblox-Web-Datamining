import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';
import SocialLinksJumbotron from '../../../ts/react/socialLinksJumbotron/components/socialLinksJumbotron';

import '../../../css/socialLinks.scss';

importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));

const templateContext = require.context('./components/templates/', true, /\.html$/);

const templates = templateCacheGenerator(
  angular,
  'socialLinksJumbotronHtmlTemplateApp',
  null,
  templateContext
);

export default templates;

window.Roblox.SocialLinksJumbotron = SocialLinksJumbotron;
