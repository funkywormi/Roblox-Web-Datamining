import { httpService } from 'core-utilities';
import realtimeConstants from '../constants/realtimeConstants';

export interface CreateTopicSubscriptionTokenResponse {
  token: string;
}

export enum TopicSubscriptionType {
  Group = 1,
  Forum = 2,
  ForumCategory = 3,
  ForumCategoryReactions = 4,
  ForumPost = 5,
  ForumPostReactions = 6
}

export type ChannelType =
  | { topicType: TopicSubscriptionType.Group | TopicSubscriptionType.Forum; groupId: number }
  | {
      topicType:
        | TopicSubscriptionType.ForumCategory
        | TopicSubscriptionType.ForumCategoryReactions
        | TopicSubscriptionType.ForumPost
        | TopicSubscriptionType.ForumPostReactions;
      groupId: number;
      entityId: string;
    };

export class ChannelHelper {
  static community(groupId: number): ChannelType {
    return { topicType: TopicSubscriptionType.Group, groupId };
  }

  static forums(groupId: number): ChannelType {
    return { topicType: TopicSubscriptionType.Forum, groupId };
  }

  static category(groupId: number, entityId: string): ChannelType {
    return { topicType: TopicSubscriptionType.ForumCategory, groupId, entityId };
  }

  static categoryReactions(groupId: number, entityId: string): ChannelType {
    return { topicType: TopicSubscriptionType.ForumCategoryReactions, groupId, entityId };
  }

  static post(groupId: number, entityId: string): ChannelType {
    return { topicType: TopicSubscriptionType.ForumPost, groupId, entityId };
  }

  static postReactions(groupId: number, entityId: string): ChannelType {
    return { topicType: TopicSubscriptionType.ForumPostReactions, groupId, entityId };
  }
}

const realtimeService = {
  createTopicSubscriptionToken: async (
    channelType: ChannelType
  ): Promise<CreateTopicSubscriptionTokenResponse> => {
    const urlConfig = {
      url: realtimeConstants.urls.getTopicSubscriptionTokenEndpoint(channelType.groupId),
      withCredentials: true
    };
    const data = {
      topicType: channelType.topicType,
      entityId: 'entityId' in channelType ? channelType.entityId : undefined
    };

    const response = await httpService.post<CreateTopicSubscriptionTokenResponse>(urlConfig, data);
    return response.data;
  }
};

export default realtimeService;
