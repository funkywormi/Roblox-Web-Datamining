import { Reaction } from '../types';

const updateReaction = (
  reactions: Reaction[],
  emoteId: string,
  togglingOn: boolean
): Reaction[] => {
  const existingReaction = reactions.find(reaction => reaction.emoteId === emoteId);

  if (!existingReaction) {
    if (!togglingOn) {
      return reactions;
    }

    return [
      ...reactions,
      {
        emoteId,
        reactionCount: 1,
        hasUserAppliedReaction: true,
        areReactionCountsVisible: reactions.every(reaction => reaction.areReactionCountsVisible)
      }
    ];
  }

  const reactionCount = existingReaction.reactionCount + (togglingOn ? 1 : -1);

  if (reactionCount <= 0) {
    return reactions.filter(reaction => reaction.emoteId !== emoteId);
  }

  return reactions.map(reaction =>
    reaction.emoteId === emoteId
      ? { ...reaction, reactionCount, hasUserAppliedReaction: togglingOn }
      : reaction
  );
};

export default updateReaction;
