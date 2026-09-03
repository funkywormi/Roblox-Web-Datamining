import React from 'react';
import { render } from 'react-dom';
import NotificationPreferencesV2 from '../containers/NotificationPreferencesV2';

const renderNotificationPreferences = (entry: Element) => {
  render(<NotificationPreferencesV2 />, entry);
};

export default renderNotificationPreferences;
