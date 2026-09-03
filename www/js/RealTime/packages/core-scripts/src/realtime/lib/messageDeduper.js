// Factory function that returns a minimal LRU (least-recently-used) cache
// backed by a Map. Map iteration order is insertion-order, so the oldest
// entry is always first — evicted when the cache reaches maxSize.
const createMessageDeduper = ({ maxSize, log: _log }) => {
  const cache = new Map();

  // Returns true if the identifier was new (successfully added), false if duplicate.
  // Either way, the identifier is added/refreshed in the cache.
  const tryAdd = messageIdentifier => {
    if (messageIdentifier == null) {
      return true;
    }

    if (cache.has(messageIdentifier)) {
      // LRU refresh: move to most-recent position
      cache.delete(messageIdentifier);
      cache.set(messageIdentifier, true);
      return false;
    }

    if (cache.size >= maxSize) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest);
    }

    cache.set(messageIdentifier, true);
    return true;
  };

  const clear = () => {
    cache.clear();
  };

  return {
    tryAdd,
    clear,
    get size() {
      return cache.size;
    },
  };
};

export default createMessageDeduper;
