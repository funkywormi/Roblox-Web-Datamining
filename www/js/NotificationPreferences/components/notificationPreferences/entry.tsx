import './src/main.css';
import './src/notificationPreferences.scss';
import Roblox from 'Roblox';
import renderNotificationPreferences from '@rbx/notifications/notificationPreferences/utils/notificationPreferencesReactMountUtility';

Object.assign(Roblox, {
  NotificationPreferencesService: {
    renderNotificationPreferences
  }
});
