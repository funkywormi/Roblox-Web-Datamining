import { EnvironmentUrls, CurrentUser } from 'Roblox';
import chatModule from '../chatModule';

// SUBS-5048: field token requested in user-profile-api/get-profiles to
// surface Roblox Plus subscription status for chat participants. Mirrors
// the workspace `@rbx/identity-badges` constants.
const PLUS_PROFILE_FIELD = 'hasRobloxSubscription';

/**
 * SUBS-5048: stitches Roblox Plus subscription status onto chat
 * conversations for the displayNameBadges directive.
 *
 * Lives outside `chatService` because the underlying endpoint is
 * `user-profile-api`, not `platform-chat-api`. Mirrors the workspace
 * `usePlusStatus` hook (in `@rbx/identity-badges`) - same endpoint,
 * same field token, same response shape.
 *
 * Callers should invoke `decoratePlusStatusOnConversations` AFTER
 * `chatService.convertChannels` has run (it expects `participants`,
 * `participant_user_ids`, `user_data`, and `initiator` to be set on
 * each conversation), and may fire-and-forget - the mutations land on
 * the same conversation objects Angular already holds, and the
 * directive's two-way binding picks up the change on the next digest.
 */
function plusIdentityBadgeService($q, httpService) {
  'ngInject';

  const fetchPlusStatusForUserIds = function (userIds) {
    const deduped = Array.from(new Set(userIds));
    if (deduped.length === 0) {
      return $q.when({});
    }
    const urlConfig = {
      url: `${EnvironmentUrls.apiGatewayUrl}/user-profile-api/v1/user/profiles/get-profiles`,
      retryable: true,
      withCredentials: true
    };
    const requestData = {
      userIds: deduped,
      fields: [PLUS_PROFILE_FIELD]
    };
    // httpService returns a native axios promise; wrap in $q so the
    // downstream `.then` resolves inside Angular's digest and the
    // directive's two-way `is-roblox-plus` binding picks up our writes.
    return $q.when(httpService.httpPost(urlConfig, requestData)).then(
      function (data) {
        const result = {};
        const rows = (data && data.profileDetails) || [];
        for (const row of rows) {
          result[row.userId] = row.hasRobloxSubscription === true;
        }
        return result;
      },
      function () {
        return {};
      }
    );
  };

  const decoratePlusStatusOnConversations = function (conversations) {
    if (!conversations || conversations.length === 0) {
      return $q.when(conversations);
    }
    const allUserIds = [];
    for (const conversation of conversations) {
      if (conversation && conversation.participant_user_ids) {
        for (const id of conversation.participant_user_ids) {
          allUserIds.push(id);
        }
      }
    }
    return fetchPlusStatusForUserIds(allUserIds).then(function (plusMap) {
      const currentUserId = parseInt(CurrentUser.userId);
      for (const conversation of conversations) {
        if (!conversation) continue;
        if (conversation.user_data) {
          for (const userIdStr of Object.keys(conversation.user_data)) {
            const userId = parseInt(userIdStr);
            if (plusMap[userId] !== undefined) {
              conversation.user_data[userIdStr].has_roblox_subscription = plusMap[userId];
            }
          }
        }
        if (conversation.participants) {
          for (const participant of conversation.participants) {
            if (participant && plusMap[participant.id] !== undefined) {
              participant.isRobloxPlus = plusMap[participant.id] === true;
            }
          }
        }
        if (conversation.initiator && plusMap[conversation.initiator.id] !== undefined) {
          conversation.initiator.isRobloxPlus = plusMap[conversation.initiator.id] === true;
        }
        if (conversation.type === 'one_to_one' && conversation.participant_user_ids) {
          for (const otherId of conversation.participant_user_ids) {
            if (otherId !== currentUserId) {
              conversation.isRobloxPlus = plusMap[otherId] === true;
              break;
            }
          }
        }
      }
      return conversations;
    });
  };

  return {
    decoratePlusStatusOnConversations
  };
}

chatModule.factory('plusIdentityBadgeService', plusIdentityBadgeService);

export default plusIdentityBadgeService;
