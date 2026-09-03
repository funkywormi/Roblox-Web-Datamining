import React, { useMemo } from 'react';
import { abbreviateNumber } from 'core-utilities';
import { Reaction } from '../types';
import ReactionEmote from '../../shared/components/reactions/ReactionEmote';
import { useEmotes } from '../../shared/contexts/EmoteContext';

export type PostPreviewReactionsProps = {
  reactions: Reaction[];
};

const MAX_VISIBLE_REACTIONS = 3;

const PostPreviewReactions = ({ reactions }: PostPreviewReactionsProps): JSX.Element | null => {
  const { getEmoteById } = useEmotes();
  const reactionCount = useMemo(() => {
    return reactions.reduce((acc, reaction) => acc + reaction.reactionCount, 0);
  }, [reactions]);

  const areReactionCountsVisible = useMemo(() => {
    return reactions.every(reaction => !!reaction.areReactionCountsVisible);
  }, [reactions]);

  // order reactions by count, pick top 3 in a memo
  const orderedReactions = useMemo(() => {
    return reactions
      .sort((a, b) => b.reactionCount - a.reactionCount)
      .slice(0, MAX_VISIBLE_REACTIONS);
  }, [reactions]);

  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className='group-forums-post-preview-reactions-container'>
      <div className='group-forums-post-preview-reactions'>
        {orderedReactions.map(reaction => {
          const emoteUrl = getEmoteById(reaction.emoteId)?.url ?? '';
          return (
            <div key={reaction.emoteId} className='group-forums-post-preview-reaction-container'>
              <ReactionEmote emoteId={reaction.emoteId} emoteUrl={emoteUrl} size={16} />
            </div>
          );
        })}
      </div>
      {areReactionCountsVisible && (
        <span className='group-forums-post-preview-reaction-count text-default'>
          {abbreviateNumber.getAbbreviatedValue(reactionCount)}
        </span>
      )}
    </div>
  );
};

export default PostPreviewReactions;
