import { unbanUser, clearContent } from '../services/groupBanService';
import { MenuAction } from '../types';

// Group ban menu actions
const GROUP_BAN_UNBAN_USER_BUTTON = {
  translationKey: 'Action.UnbanUser',
  id: 'unban-user-button',
  onClick: unbanUser,
  onSuccess: ({ setShowUserCard, translate, systemFeedbackService }) => {
    setShowUserCard(false);
    systemFeedbackService.success(translate('Message.UnbanUserSuccess'));
  },
  onError: ({ translate, systemFeedbackService }) => {
    systemFeedbackService.warning(translate('Message.UnbanUserSuccess'));
  }
} as MenuAction;

const GROUP_BAN_REMOVE_CONTENT_BUTTON = {
  translationKey: 'Action.RemoveContent',
  id: 'remove-content-button',
  onClick: clearContent,
  onSuccess: ({ translate, systemFeedbackService }) => {
    systemFeedbackService.success(translate('Message.RemoveContentSuccess'));
  },
  onError: ({ translate, systemFeedbackService }) => {
    systemFeedbackService.warning(translate('Message.DeleteWallPostsByUserError'));
  }
} as MenuAction;

export { GROUP_BAN_UNBAN_USER_BUTTON, GROUP_BAN_REMOVE_CONTENT_BUTTON };
