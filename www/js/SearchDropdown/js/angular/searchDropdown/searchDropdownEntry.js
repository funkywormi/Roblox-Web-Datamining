import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

// import main scss file
import '../../../css/searchDropdown.scss';

// import main module definition.
import searchDropdownModule from './searchDropdownModule';

importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

templateCacheGenerator(angular, 'searchDropdownHtmlTemplate', templateContext);

export default searchDropdownModule;
