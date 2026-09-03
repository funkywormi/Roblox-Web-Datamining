import { TranslateFunction } from 'react-utilities';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import { usePost } from '../contexts/PostContext';
import { useCommunityFeatureFreezes } from '../../shared/contexts/CommunityFeatureFreezesContext';
import useForumStore from './useForumStore';
import useForumTierGate from './useForumTierGate';

type ReplyDisabledState = {
  disabled: boolean;
  disabledTooltip?: string;
  showTierGate?: boolean;
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

  if (forumsWrite.isDisabled) {
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

  if (post?.isLocked) {
    return { disabled: true, disabledTooltip: translate('Description.NoReplyLocked') };
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

  return { disabled: false };
};

export default useReplyDisabledState;
