import React from 'react';
import { CurrentUser } from 'Roblox';
// eslint-disable-next-line import/no-unresolved
import { InlinePrompt } from '@rbx/prompts-orchestrator';
import { useGroupProfileHeaderContext } from '../groupProfileHeader/context/GroupProfileHeaderContext';

const CommunityCompletionCarousel: React.FC = () => {
  const { groupId, communityProfileHeaderData } = useGroupProfileHeaderContext();

  if (
    !CurrentUser?.userId ||
    communityProfileHeaderData?.ownerUserId !== Number(CurrentUser.userId)
  ) {
    return null;
  }

  return (
    <InlinePrompt
      entryPoint='CommunityPageOpen'
      promptStyle='CardContainer'
      clientAttributes={{ groupId: String(groupId) }}
    />
  );
};

export default CommunityCompletionCarousel;
