// How a chunk of consecutive messages renders:
//   plain    - not concealed: shown inline, outside any toggle
//   hidden   - collapsed behind a "Show N" toggle
//   revealed - the user opened it: shown inline with a "Hide N" toggle
//   forced   - deep-link / just-arrived: shown inline with no toggle
export type MessageChunkMode = 'plain' | 'hidden' | 'revealed' | 'forced';
export type MessageChunk<T> = { items: T[]; mode: MessageChunkMode };

// Splits a list into consecutive chunks by render mode in a single pass.
export const groupMessageChunks = <T extends { id: string; isConcealed?: boolean }>(
  items: T[],
  isConcealmentEnabled: boolean,
  revealedIds: Set<string>,
  forceRevealIds: Set<string>
): MessageChunk<T>[] => {
  const modeOf = (item: T): MessageChunkMode => {
    const concealed = isConcealmentEnabled && item.isConcealed === true;
    if (!concealed) {
      return 'plain';
    }
    if (revealedIds.has(item.id)) {
      return 'revealed';
    }
    if (forceRevealIds.has(item.id)) {
      return 'forced';
    }
    return 'hidden';
  };

  const chunks: MessageChunk<T>[] = [];
  let current: MessageChunk<T> | null = null;

  items.forEach(item => {
    const mode = modeOf(item);
    if (current && current.mode === mode) {
      current.items.push(item);
    } else {
      current = { items: [item], mode };
      chunks.push(current);
    }
  });

  return chunks;
};
