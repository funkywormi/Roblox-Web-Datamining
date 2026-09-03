import { importFilesUnderPath } from 'roblox-es6-migration-helper';

// import main module definition.
import './phoneValidationModule';

import './vendors/phoneNumbers/libPhoneNumber';

// import all other js files for avatarModule
importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./filters/', true, /\.js$/));
