import React, { useEffect, useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Popover } from 'react-style-guide';
import classNames from 'classnames';
import { Reaction } from '../types';
import { groupsConfig } from '../translation.config';
import ReactionPicker from '../../shared/components/reactions/ReactionPicker';
import CommentReactionWrapper from './CommentReactionWrapper';
import { useEmotes } from '../../shared/contexts/EmoteContext';

export type CommentReactionsProps = {
  initialReactions: Reaction[];
  onToggleReaction: (reactionId: string, togglingOn: boolean) => Promise<boolean>;
  maxReactionPerLine?: number;
  viewOnly: boolean;
} & WithTranslationsProps;

const CommentReactions = ({
  initialReactions,
  onToggleReaction,
  maxReactionPerLine = 6,
  viewOnly
}: CommentReactionsProps): JSX.Element => {
  const [reactions, setReactions] = React.useState(initialReactions);
  const [isOverflowOpen, setIsOverflowOpen] = React.useState(false);
  const { getEmoteById, emoteList } = useEmotes();

  useEffect(() => {
    setReactions(initialReactions);
  }, [initialReactions]);

  // Only show counts when _all_ reactions opt in; a single reaction with counts hidden
  // collapses the whole group to count-less to avoid leaking partial information.
  const areReactionCountsVisible = useMemo(
    () => initialReactions.every(reaction => !!reaction.areReactionCountsVisible),
    [initialReactions]
  );

  const reactionDisplayCount = useMemo(() => {
    if (isOverflowOpen) {
      return reactions.length;
    }
    return reactions.length <= maxReactionPerLine ? maxReactionPerLine : maxReactionPerLine - 1;
  }, [isOverflowOpen, maxReactionPerLine, reactions.length]);

  const handleToggleReaction = async (reactionId: string) => {
    if (viewOnly) {
      return;
    }
    let reactionExists = false;
    let togglingOn = false;
    const updatedReactions = reactions
      .map(reaction => {
        if (reaction.emoteId === reactionId) {
          reactionExists = true;
          togglingOn = !reaction.hasUserAppliedReaction;
          const newCount = reaction.hasUserAppliedReaction
            ? reaction.reactionCount - 1
            : reaction.reactionCount + 1;

          if (newCount === 0) {
            return null;
          }
          return {
            ...reaction,
            hasUserAppliedReaction: !reaction.hasUserAppliedReaction,
            reactionCount: newCount
          };
        }
        return reaction;
      })
      .filter(reaction => reaction !== null) as Reaction[];

    if (!reactionExists) {
      togglingOn = true;
      updatedReactions.push({
        emoteId: reactionId,
        reactionCount: 1,
        hasUserAppliedReaction: true,
        areReactionCountsVisible
      });
    }

    setReactions(updatedReactions);

    const result = await onToggleReaction(reactionId, togglingOn);
    if (!result) {
      setReactions(reactions);
    }
  };

  const onToggleOverflow = () => {
    setIsOverflowOpen(prev => !prev);
  };

  const handleToggleOverflowDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggleOverflow();
    }
  };

  const renderReaction = (reaction: Reaction, containerClassName: string) => {
    const emote = getEmoteById(reaction.emoteId);
    const emoteUrl = emote ? emote.url : '';
    return (
      <CommentReactionWrapper
        key={`${reaction.emoteId}-${containerClassName}`}
        reaction={reaction}
        containerClassName={containerClassName}
        areReactionCountsVisible={areReactionCountsVisible}
        emoteUrl={emoteUrl}
        onToggleReaction={handleToggleReaction}
      />
    );
  };

  const addReactionButton = (
    <div role='button' tabIndex={0} className='group-forums-comment-reactions-add-new'>
      <span className='group-forums-comment-reactions-add-new-icon' />
    </div>
  );

  return (
    <div className='group-forums-comment-reactions'>
      {!viewOnly && (
        <Popover
          id='group-forums-reaction-picker-container'
          button={addReactionButton}
          trigger='click'
          placement='bottom'>
          <ReactionPicker emotes={emoteList} onSelect={handleToggleReaction} />
        </Popover>
      )}
      <div className='group-forums-comment-reactions-container'>
        {reactions
          .slice(0, reactionDisplayCount)
          .map(reaction => renderReaction(reaction, 'show-on-native'))}
        {reactions.map(reaction => renderReaction(reaction, 'hide-on-native'))}
        {reactions.length > maxReactionPerLine && (
          <div
            role='button'
            tabIndex={0}
            onClick={onToggleOverflow}
            onKeyDown={handleToggleOverflowDown}
            className='group-forums-comment-reactions-overflow show-on-native'>
            <span
              className={classNames(
                isOverflowOpen
                  ? 'group-forums-comment-reactions-hide-icon'
                  : 'group-forums-comment-reactions-overflow-icon'
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default withTranslations(CommentReactions, groupsConfig);
