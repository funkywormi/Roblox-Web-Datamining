import React, { useMemo, useState } from 'react';
import ConcealedMessages from './ConcealedMessages';
import { groupMessageChunks } from '../utils/messageChunks';

type ConcealableEntity = 'comment' | 'post' | 'reply';

export type MessagesProps<T extends { id: string; isConcealed?: boolean }> = {
  items: T[];
  isConcealmentEnabled: boolean;
  forceRevealIds: Set<string>;
  renderItem: (item: T, isConcealedAndShown: boolean) => React.ReactNode;
  entity?: ConcealableEntity;
  revealConcealedByDefault?: boolean;
};

const Messages = <T extends { id: string; isConcealed?: boolean }>({
  items,
  isConcealmentEnabled,
  forceRevealIds,
  renderItem,
  entity = 'comment',
  revealConcealedByDefault = false
}: MessagesProps<T>): JSX.Element => {
  // Seed the reveal state so a cascaded reveal opens the concealed items up front. Force-revealed
  // items (deep-link / just-arrived) are left out of the seed so they stay `forced` (no toggle)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() =>
    revealConcealedByDefault
      ? new Set(
          items
            .filter(item => item.isConcealed === true && !forceRevealIds.has(item.id))
            .map(item => item.id)
        )
      : new Set()
  );

  const chunks = useMemo(
    () => groupMessageChunks(items, isConcealmentEnabled, revealedIds, forceRevealIds),
    [items, isConcealmentEnabled, revealedIds, forceRevealIds]
  );

  const toggleChunk = (ids: string[]): void => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      const isOpen = ids.some(id => next.has(id));
      ids.forEach(id => (isOpen ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  return (
    <React.Fragment>
      {chunks.map(chunk => {
        if (chunk.mode !== 'plain') {
          const chunkIds = chunk.items.map(item => item.id);

          return (
            <ConcealedMessages
              key={`concealed-${chunk.items[0].id}`}
              messageType={entity}
              count={chunk.items.length}
              isRevealed={chunk.mode === 'revealed'}
              isForceRevealed={chunk.mode === 'forced'}
              onToggle={() => toggleChunk(chunkIds)}
              renderItems={() => chunk.items.map(item => renderItem(item, true))}
            />
          );
        }

        return (
          <React.Fragment key={`chunk-${chunk.items[0].id}`}>
            {chunk.items.map(item => renderItem(item, false))}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

export default Messages;
