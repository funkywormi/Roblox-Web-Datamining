import React, { useEffect, useMemo } from 'react';
import { Popover } from 'react-style-guide';
import classNames from 'classnames';
import { Reaction } from '../../types';
import ReactionPicker from './ReactionPicker';
import ReactionEmote from './ReactionEmote';
import { useEmotes } from '../../contexts/EmoteContext';
import AnimatedAbbreviatedCount from '../AnimatedAbbreviatedCount';

export type ContentReactionsProps = {
  initialReactions: Reaction[];
  onToggleReaction: (reactionId: string, togglingOn: boolean) => Promise<boolean>;
  maxReactionPerLine?: number;
  viewOnly: boolean;
};

const ContentReactions = ({
  initialReactions,
  onToggleReaction,
  maxReactionPerLine = 6,
  viewOnly
}: ContentReactionsProps): JSX.Element => {
  const [reactions, setReactions] = React.useState(initialReactions);
  const [isOverflowOpen, setIsOverflowOpen] = React.useState(false);
  const { getEmoteById, emoteList } = useEmotes();

  useEffect(() => {
    setReactions(initialReactions);
  }, [initialReactions]);

  // Derived from initialReactions: true only when every reaction has the counts-visible flag set.
  const areReactionCountsVisible = useMemo(
    () => initialReactions.every(r => !!r.areReactionCountsVisible),
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

    // Snapshot before the optimistic update so a failed server call reverts exactly to
    // the state that was visible when this toggle started, not to a stale closure.
    const prev = reactions;
    setReactions(updatedReactions);

    const result = await onToggleReaction(reactionId, togglingOn);
    if (!result) {
      setReactions(prev);
    }
  };

  const onToggleOverflow = () => {
    setIsOverflowOpen(prev => !prev);
  };

  const handleToggleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, reactionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // eslint-disable-next-line no-void
      void handleToggleReaction(reactionId);
    }
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
      <div
        key={reaction.emoteId}
        className={classNames('groups-content-reactions-reaction', containerClassName, {
          'groups-content-reactions-reaction-active': reaction.hasUserAppliedReaction
        })}
        role='button'
        tabIndex={0}
        onClick={() => handleToggleReaction(reaction.emoteId)}
        onKeyDown={e => handleToggleKeyDown(e, reaction.emoteId)}>
        <ReactionEmote emoteId={reaction.emoteId} emoteUrl={emoteUrl} size={16} />
        {areReactionCountsVisible && (
          <AnimatedAbbreviatedCount
            variant='reaction'
            value={reaction.reactionCount}
            className={classNames('groups-content-reactions-count', {
              'font-bold': reaction.hasUserAppliedReaction
            })}
          />
        )}
      </div>
    );
  };

  const addReactionButton = (
    <div role='button' tabIndex={0} className='groups-content-reactions-add-new'>
      <span className='groups-content-reactions-add-new-icon' />
    </div>
  );

  return (
    <div className='groups-content-reactions'>
      {!viewOnly && (
        <Popover
          id='group-forums-reaction-picker-container'
          button={addReactionButton}
          trigger='click'
          placement='bottom'>
          <ReactionPicker emotes={emoteList} onSelect={handleToggleReaction} />
        </Popover>
      )}
      <div className='groups-content-reactions-container'>
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
            className='groups-content-reactions-overflow show-on-native'>
            <span
              className={classNames(
                isOverflowOpen
                  ? 'groups-content-reactions-hide-icon'
                  : 'groups-content-reactions-overflow-icon'
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentReactions;
