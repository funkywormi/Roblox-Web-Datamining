import { httpService } from 'core-utilities';
import { urls } from '../constants/groupBanConstants';
import { MenuActionCallbackArgs } from '../types';

const FORUMS_NOT_AVAILABLE_STATUS_CODE = 405;

const unbanUser = async ({ groupId, userId }: MenuActionCallbackArgs): Promise<boolean> => {
  const urlConfig = {
    url: urls.userGroupBan(groupId, userId),
    withCredentials: true
  };

  try {
    await httpService.delete(urlConfig);
  } catch (error) {
    return false;
  }

  return true;
};

const clearContent = async ({ groupId, userId }: MenuActionCallbackArgs): Promise<boolean> => {
  const deleteForumPostsUrlConfig = {
    url: urls.deleteForumPostsByUser(groupId, userId),
    withCredentials: true
  };

  try {
    await httpService.delete(deleteForumPostsUrlConfig);
  } catch (error) {
    const typedError = error as { status: number };

    if (typedError.status !== FORUMS_NOT_AVAILABLE_STATUS_CODE) {
      return false;
    }
  }

  return true;
};

export { unbanUser, clearContent };
