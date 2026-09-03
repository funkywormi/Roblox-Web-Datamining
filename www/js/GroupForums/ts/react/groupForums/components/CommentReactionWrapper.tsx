import React from 'react';
import classNames from 'classnames';
import { Reaction } from '../types';
import ReactionEmote from '../../shared/components/reactions/ReactionEmote';
import AnimatedAbbreviatedCount from '../../shared/components/AnimatedAbbreviatedCount';

export type CommentReactionWrapperProps = {
  reaction: Reaction;
  containerClassName: string;
  areReactionCountsVisible: boolean;
  emoteUrl: string;
  onToggleReaction: (reactionId: string) => void | Promise<void>;
};

const CommentReactionWrapper = ({
  reaction,
  containerClassName,
  areReactionCountsVisible,
  emoteUrl,
  onToggleReaction
}: CommentReactionWrapperProps): JSX.Element => {
  const handleToggleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // eslint-disable-next-line no-void
      void onToggleReaction(reaction.emoteId);
    }
  };

  return (
    <div
      className={classNames('group-forums-comment-reactions-reaction', containerClassName, {
        'group-forums-comment-reactions-reaction-active': reaction.hasUserAppliedReaction
      })}
      role='button'
      tabIndex={0}
      onClick={() => onToggleReaction(reaction.emoteId)}
      onKeyDown={handleToggleKeyDown}>
      <ReactionEmote emoteId={reaction.emoteId} emoteUrl={emoteUrl} size={16} />
      {areReactionCountsVisible && (
        <AnimatedAbbreviatedCount
          variant='reaction'
          value={reaction.reactionCount}
          className={classNames({
            'font-bold': reaction.hasUserAppliedReaction
          })}
        />
      )}
    </div>
  );
};

export default CommentReactionWrapper;
