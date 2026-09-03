import { authenticatedUser } from 'header-scripts';

const getProfileUserId = () => {
  const reg = /\/users\/(\d+)\//g;
  const match = reg.exec(window?.location?.pathname);
  const userId = match ? parseInt(match[1], 10) : null;
  const profileUserId = userId ?? authenticatedUser?.id;
  return profileUserId;
};

export default {
  getProfileUserId
};
