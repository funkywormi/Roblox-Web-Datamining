import { fetchPlusStatusForUsers } from "./plusStatusService";

type PendingResolver = {
  resolve: (value: boolean) => void;
  reject: (reason: unknown) => void;
};

let pending = new Map<number, PendingResolver[]>();
let scheduled = false;

const flush = async (): Promise<void> => {
  const batch = pending;
  pending = new Map<number, PendingResolver[]>();
  scheduled = false;
  if (batch.size === 0) {
    return;
  }
  const ids = [...batch.keys()];
  try {
    const result = await fetchPlusStatusForUsers(ids);
    for (const id of ids) {
      const resolvers = batch.get(id) ?? [];
      for (const { resolve } of resolvers) {
        resolve(result[id] === true);
      }
    }
  } catch (error) {
    for (const id of ids) {
      const resolvers = batch.get(id) ?? [];
      for (const { reject } of resolvers) {
        reject(error);
      }
    }
  }
};

// Coalesces concurrent `requestPlusStatus(id)` calls within the same microtask
// tick into a single batched `fetchPlusStatusForUsers` HTTP request. Lets the
// `usePlusStatus` hook expose one react-query entry per user (via `useQueries`)
// without producing N parallel network calls when N ids land together.
export const requestPlusStatus = (userId: number): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    const resolvers = pending.get(userId) ?? [];
    resolvers.push({ resolve, reject });
    pending.set(userId, resolvers);
    if (!scheduled) {
      scheduled = true;
      queueMicrotask(() => {
        flush().catch(() => undefined);
      });
    }
  });
};
