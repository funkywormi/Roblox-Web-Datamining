import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import currentWearingContants from './constants/currentWearingContants';
import CurrentWearingContainer from './containers/currentWearingContainer';

import '../../../css/currentWearing/currentWearing.scss';

ready(() => {
  if (currentWearingContants.currentWearingContainer()) {
    render(<CurrentWearingContainer />, currentWearingContants.currentWearingContainer());
  }
});
