import { TranslateFunction } from 'react-utilities';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import { usePost } from '../contexts/PostContext';
import { useCommunityFeatureFreezes } from '../../shared/contexts/CommunityFeatureFreezesContext';
import useForumStore from './useForumStore';
import useForumTierGate from './useForumTierGate';

export type ReplyDisabledState = {
  disabled: boolean;
  disabledTooltip?: string;
  showTierGate?: boolean;
};

export type ReplyConditions = {
  isWriteFrozen: boolean;
  isCategoryArchived: boolean;
  canCreateComment: boolean;
  isPostLocked: boolean;
};

// The post cards gather these from the post they render, so the reasons live apart from the
// contexts that the post page reads them from.
export const getReplyDisabledState = (
  { isWriteFrozen, isCategoryArchived, canCreateComment, isPostLocked }: ReplyConditions,
  translate: TranslateFunction
): ReplyDisabledState => {
  if (isWriteFrozen) {
    return {
      disabled: true,
      disabledTooltip: translate('Description.ReplyCommentDisabled')
    };
  }
  if (isCategoryArchived) {
    return { disabled: true, disabledTooltip: translate('Description.PostArchived') };
  }

  if (!canCreateComment) {
    return { disabled: true, disabledTooltip: translate('Description.NoReplyPermission') };
  }

  if (isPostLocked) {
    return { disabled: true, disabledTooltip: translate('Description.NoReplyLocked') };
  }

  return { disabled: false };
};

const useReplyDisabledState = ({
  translate
}: {
  translate: TranslateFunction;
}): ReplyDisabledState => {
  const { canCreateComment } = useForumPermissions();
  const { post } = usePost();
  const { forumsWrite } = useCommunityFeatureFreezes();
  const isCategoryArchived = useForumStore.use.isCategoryArchived();
  const { isTierGated, isResolving } = useForumTierGate();

  const replyState = getReplyDisabledState(
    {
      isWriteFrozen: forumsWrite.isDisabled,
      isCategoryArchived,
      canCreateComment,
      isPostLocked: !!post?.isLocked
    },
    translate
  );

  if (replyState.disabled) {
    return replyState;
  }

  // Fail closed until the gate resolves, but without the gate message: the viewer
  // may well turn out to be ungated, so this is a plain disabled composer.
  if (isResolving) {
    return { disabled: true };
  }

  if (isTierGated) {
    return {
      disabled: true,
      showTierGate: true
    };
  }

  return replyState;
};

export default useReplyDisabledState;
