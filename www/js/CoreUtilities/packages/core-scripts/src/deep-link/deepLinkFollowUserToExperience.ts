import { DeepLink } from "./deepLinkConstants";

const deepLinkFollowUserToExperience = (target: DeepLink): Promise<boolean> => {
  const { userId } = target.params;
  if (userId) {
    window.location.href = `/games/start?userId=${userId}`;
  }
  return Promise.resolve(Boolean(userId));
};

export default deepLinkFollowUserToExperience;
