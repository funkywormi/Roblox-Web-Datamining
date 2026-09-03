import { RealTime } from 'Roblox';
import realtimeService, { ChannelType } from '../services/realtimeService';

/** Values match realtime JSON `signalType` strings from community-signals. */
export const CommunitySignalType = {
  ForumPostCreated: 'ForumPostCreated',
  ForumCommentCreated: 'ForumCommentCreated',
  ForumPostReactionChanged: 'ForumPostReactionChanged',
  ForumCommentReactionChanged: 'ForumCommentReactionChanged',
  ForumPostDeleted: 'ForumPostDeleted',
  ForumCommentUpdated: 'ForumCommentUpdated',
  RoleUpdated: 'RoleUpdated',
  AnnouncementReactionChanged: 'AnnouncementReactionChanged',
  AnnouncementPollResponded: 'AnnouncementPollResponded'
} as const;

type ValueOf<T> = T[keyof T];

export type CommunitySignalType = ValueOf<typeof CommunitySignalType>;

export type BasePayload = {
  signalType: CommunitySignalType;
};

export type ForumsPayload = BasePayload & {
  forumCategoryId?: string;
  forumPostId?: string;
  forumCommentId?: string;
};

export type Dispatch = (event: ChannelType, message: unknown) => void;

type ActiveChannelSubscription = {
  channelType: ChannelType;
  token: string | null;
  clearTopicSubscription: (() => void) | null;
  subscriptionGeneration: number;
};

const client = RealTime.Factory.GetClient();

export class RealtimeClientProxy {
  private readonly subscriptions = new Map<string, ActiveChannelSubscription>();

  private dispatch: Dispatch;

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  subscribe(channelType: ChannelType, channelKey: string): void {
    if (this.subscriptions.has(channelKey)) {
      return;
    }

    const state: ActiveChannelSubscription = {
      channelType,
      token: null,
      clearTopicSubscription: null,
      subscriptionGeneration: 0
    };
    this.subscriptions.set(channelKey, state);

    state.subscriptionGeneration += 1;
    const generation = state.subscriptionGeneration;

    realtimeService
      .createTopicSubscriptionToken(channelType)
      .then(data => {
        const current = this.subscriptions.get(channelKey);
        if (!current || generation !== current.subscriptionGeneration) {
          return;
        }

        if (!data.token) {
          throw new Error('No token received');
        }

        current.token = data.token;
        current.clearTopicSubscription = client.SubscribeToTopicNotification(
          data.token,
          (message: unknown) => {
            const active = this.subscriptions.get(channelKey);
            if (active?.channelType) {
              try {
                const deserializedMessage = JSON.parse(message as string) as unknown;
                this.dispatch(active.channelType, deserializedMessage);
              } catch (error) {
                console.error('Failed to deserialize realtime message', error, message);
              }
            }
          }
        ).unsubscribe;
      })
      .catch(err => {
        const current = this.subscriptions.get(channelKey);
        if (!current || generation !== current.subscriptionGeneration) {
          return;
        }
        console.error('Failed to get realtime token', err);
      });
  }

  unsubscribeChannel(channelKey: string): void {
    const state = this.subscriptions.get(channelKey);
    if (!state) {
      return;
    }
    state.subscriptionGeneration += 1;
    state.clearTopicSubscription?.();
    state.clearTopicSubscription = null;
    state.token = null;
    this.subscriptions.delete(channelKey);
  }

  unsubscribe(): void {
    for (const key of Array.from(this.subscriptions.keys())) {
      this.unsubscribeChannel(key);
    }
  }
}
