import useForumStore from './useForumStore';
import useCountdown, { UseCountdownResult } from '../../shared/hooks/useCountdown';

export type RateLimitType = 'post' | 'comment';

const useForumsRateLimitCountdown = (type: RateLimitType): UseCountdownResult => {
  const isPost = type === 'post';

  const expiresAt = isPost
    ? useForumStore.use.postRateLimitExpiresAt() ?? 0
    : useForumStore.use.commentRateLimitExpiresAt() ?? 0;

  const setExpiresAt = isPost
    ? useForumStore.use.setPostRateLimitExpiresAt()
    : useForumStore.use.setCommentRateLimitExpiresAt();

  return useCountdown(expiresAt, setExpiresAt);
};

export default useForumsRateLimitCountdown;
