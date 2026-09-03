import { CommunitySignalType, ForumsPayload } from '../../shared/utils/realtimeProxy';

export function buildForumPostIdToSignalTypeMap(
  messages: ForumsPayload[]
): Map<string, CommunitySignalType> {
  const map = new Map<string, CommunitySignalType>();
  for (const message of messages) {
    const postId = message.forumPostId;
    if (postId && message.signalType) {
      map.set(postId, message.signalType);
    }
  }
  return map;
}

export function uniqueForumPostIdsFromMessages(messages: ForumsPayload[]): string[] {
  const ids = messages
    .map(message => message.forumPostId)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
  return Array.from(new Set(ids));
}
