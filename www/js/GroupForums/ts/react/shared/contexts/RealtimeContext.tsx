import React, { createContext, useContext, useRef, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { ChannelType, TopicSubscriptionType } from '../services/realtimeService';
import { RealtimeClientProxy } from '../utils/realtimeProxy';

type EventCallback<T> = (message: T) => void;

export type RealtimeBatchedCallback<T> = (messages: T[]) => void;

type RealtimeContextType = {
  subscribe: <T>(channel: ChannelType, callback: EventCallback<T>) => void;
  unsubscribe: <T>(channel: ChannelType, callback: EventCallback<T>) => void;
};

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within a RealtimeProvider');
  return ctx;
};

const channelToString = (channel: ChannelType): string => {
  switch (channel.topicType) {
    case TopicSubscriptionType.Group:
      return `${channel.groupId}`;
    case TopicSubscriptionType.Forum:
      return `${channel.groupId}:forums`;
    case TopicSubscriptionType.ForumCategory:
    case TopicSubscriptionType.ForumCategoryReactions:
    case TopicSubscriptionType.ForumPost:
    case TopicSubscriptionType.ForumPostReactions:
      return `${channel.groupId}:forums:${channel.entityId}:${channel.topicType}`;
    default:
      throw new Error('Unknown channel type');
  }
};

/** Queues messages and invokes `callback` with a batch after `debounceMs` idle. Pass `null` to skip. */
export function useRealtimeSubscription<T>(
  channel: ChannelType | null | undefined,
  callback: RealtimeBatchedCallback<T>,
  debounceMs = 500
): void {
  const { subscribe, unsubscribe } = useRealtime();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (channel == null) {
      return undefined;
    }

    const pending: T[] = [];
    const flush = () => {
      if (pending.length === 0) {
        return;
      }
      const batch = pending.splice(0, pending.length);
      callbackRef.current(batch);
    };

    const debouncedFlush = debounce(flush, debounceMs);

    const stableHandler = (message: T) => {
      pending.push(message);
      debouncedFlush();
    };

    subscribe(channel, stableHandler);
    return () => {
      debouncedFlush.cancel();
      flush();
      unsubscribe(channel, stableHandler);
    };
  }, [channel, subscribe, unsubscribe, debounceMs]);
}

type ChannelsMap = Map<string, Set<EventCallback<unknown>>>;

export const RealtimeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const channelSubscriptions = useRef<ChannelsMap>(new Map());
  const realtimeService = useRef<RealtimeClientProxy | null>(null);

  const publish = useCallback((channel: ChannelType, message: unknown) => {
    const channelKey = channelToString(channel);
    const subscribers = channelSubscriptions.current.get(channelKey);
    if (subscribers) {
      // Copy to array to avoid issues if a callback unsubscribes itself
      Array.from(subscribers).forEach(cb => cb(message));
    }
  }, []);

  if (!realtimeService.current) {
    realtimeService.current = new RealtimeClientProxy(publish);
  }

  useEffect(() => {
    const channels = channelSubscriptions.current;
    const service = realtimeService.current;
    return () => {
      service?.unsubscribe();
      channels.clear();
    };
  }, []);

  const subscribe = useCallback(
    <T,>(channel: ChannelType, callback: EventCallback<T>) => {
      const channelKey = channelToString(channel);
      if (!channelSubscriptions.current.has(channelKey)) {
        realtimeService.current?.subscribe(channel, channelKey);
        channelSubscriptions.current.set(channelKey, new Set());
      }
      const subscribers = channelSubscriptions.current.get(channelKey);
      if (!subscribers) {
        return;
      }
      if (!subscribers.has(callback as EventCallback<unknown>)) {
        subscribers.add(callback as EventCallback<unknown>);
      }
    },
    [channelSubscriptions]
  );

  const unsubscribe = useCallback(
    <T,>(channel: ChannelType, callback: EventCallback<T>) => {
      const channelKey = channelToString(channel);
      channelSubscriptions.current.get(channelKey)?.delete(callback as EventCallback<unknown>);
      if (channelSubscriptions.current.get(channelKey)?.size === 0) {
        channelSubscriptions.current.delete(channelKey);
        realtimeService.current?.unsubscribeChannel(channelKey);
      }
    },
    [channelSubscriptions]
  );

  return (
    <RealtimeContext.Provider value={{ subscribe, unsubscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
};
