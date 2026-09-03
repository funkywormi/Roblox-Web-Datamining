import { combineReducers } from 'redux';
import friends from './friends';
import metadata from './metaData';
import tabLoader from './tabLoader';
import errorType from './errorType';

export default combineReducers({
  friends,
  metadata,
  tabLoader,
  errorType
});
