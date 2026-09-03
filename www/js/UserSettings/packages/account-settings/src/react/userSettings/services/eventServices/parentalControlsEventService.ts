import { eventStreamService } from "core-roblox-utilities";
import { matchPath } from "react-router-dom";
import {
  SpendNotificationSetting,
  TOptionValue,
  TUpdateUserSettingValueRequest,
} from "@rbx/user-settings";
import wrapEventServiceWithTryCatch from "../../../../core/utils/eventUtils";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import SpendSettingName from "../../../../enums/SpendSettingName";
import ParentalControlsPageName from "../../../../enums/parentalControls/ParentalControlsPageName";
import SettingCategoryPageName from "../../../../enums/SettingCategoryPageName";
import { TSettingsPage } from "../../../../types/commonTypes";
import PrivacySettingName from "../../../../enums/privacy/PrivacySettingName";
import { getEventParams } from "../../constants/eventConstants";
import birthdayUtils from "../../utils/birthdayUtils";
import { optionToString } from "../../utils/parentalControls/parentalConsentUtils";

const parentalControlsChildState = (child: TChildInfo): string => {
  const age = birthdayUtils.calculateAgeFromISO(child.birthDate);
  let ageState;
  if (age < 13) {
    ageState = "U13";
  } else if (age < 18) {
    ageState = "13-17";
  } else {
    // Children shouldn't be 18+ but just in case
    ageState = "18Plus";
  }
  return `${ageState} ${child.userId}`;
};

const parentalControlsFriendState = (child: TChildInfo, friendUserId: number): string => {
  return `${parentalControlsChildState(child)} ${friendUserId}`;
};

const parentalControlsExperienceState = (
  child: TChildInfo,
  universeId: number,
  sessionId?: string,
): string => {
  return `${parentalControlsChildState(child)} ${universeId} ${sessionId || ""}`;
};

const consentState = (settingName: string, consentId: string): string => {
  return `${settingName} ${consentId}`;
};

const parentalControlsEventService = {
  allowedExperiencesEventsUpdated: wrapEventServiceWithTryCatch(
    (ageRecommendation: string): void => {
      const params = getEventParams.allowedExperiences(ageRecommendation);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsAddParent: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authButtonClickSettingsPControlsAddParent();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsPControlsUpdateAttempt: wrapEventServiceWithTryCatch(
    (request: TUpdateUserSettingValueRequest, child: TChildInfo): void => {
      const state = parentalControlsChildState(child);
      const params = getEventParams.authButtonClickSettingsPControlsUpdateAttempt(
        `settingName: ${request.setting} settingValue:${optionToString(request.value!)} ${state}`,
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Cancel parental consent request modal events
  authModalShownSettingsPControlsCancelRequest: wrapEventServiceWithTryCatch(
    (settingName: string, consentId: string): void => {
      const state = consentState(settingName, consentId);
      const params = getEventParams.authModalShownSettingsPControlsCancelRequest(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsCancelParentRequest: wrapEventServiceWithTryCatch(
    (settingName: string, consentId: string): void => {
      const state = consentState(settingName, consentId);
      const params = getEventParams.authButtonClickSettingsPControlsCancelParentRequest(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsDoNotCancelParentRequest: wrapEventServiceWithTryCatch(
    (settingName: string, consentId: string): void => {
      const state = consentState(settingName, consentId);
      const params = getEventParams.authButtonClickSettingsPControlsDoNotCancelParentRequest(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Parent dashboard page load events
  authPageloadSettingsPControlsChild: wrapEventServiceWithTryCatch((state: string): void => {
    const params = getEventParams.authPageloadSettingsPControlsChild(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsPControlsConsentCenter: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsConsentCenter(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authPageloadSettingsPControlsEditProfile: wrapEventServiceWithTryCatch((state: string): void => {
    const params = getEventParams.authPageloadSettingsPControlsEditProfile(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsPControlsScreentime: wrapEventServiceWithTryCatch((state: string): void => {
    const params = getEventParams.authPageloadSettingsPControlsScreentime(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsPControlsFriends: wrapEventServiceWithTryCatch((state: string): void => {
    const params = getEventParams.authPageloadSettingsPControlsFriends(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsPControlsTrustedFriends: wrapEventServiceWithTryCatch(
    (child: TChildInfo): void => {
      const state = parentalControlsChildState(child);
      const params = getEventParams.authPageloadSettingsPControlsTrustedFriends(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Content maturity
  authPageloadSettingsPControlsContentMaturity: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsContentMaturity(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authPageloadSettingsPControlsSensitiveIssues: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsSensitiveIssues(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Communication
  authPageloadSettingsPControlsCommunication: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsCommunication(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authPageloadSettingsPControlsExperienceChat: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsExperienceChat(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authPageloadSettingsPControlsParty: wrapEventServiceWithTryCatch((state: string): void => {
    const params = getEventParams.authPageloadSettingsPControlsParty(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsPControlsVoiceDataUsage: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsVoiceDataUsage(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authPageloadSettingsPControlsCreatorCollaboration: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsCreatorCollaboration(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Spending
  authPageloadSettingsPControlsSpending: wrapEventServiceWithTryCatch((state: string): void => {
    const params = getEventParams.authPageloadSettingsPControlsSpending(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsPControlsAllowPurchases: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsAllowPurchases(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Visibility and private servers
  authPageloadSettingsPControlsVisibilityPrivateServers: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsVisibilityPrivateServers(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authPageloadSettingsPControlsDiscoverability: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsDiscoverability(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authPageloadSettingsPControlsVisibility: wrapEventServiceWithTryCatch((state: string): void => {
    const params = getEventParams.authPageloadSettingsPControlsVisibility(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsPControlsPrivateServers: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsPrivateServers(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Trading and inventory
  authPageloadSettingsPControlsTradingInventory: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsTradingInventory(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Third-party apps
  authPageloadSettingsPControlsThirdPartyApplications: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsThirdPartyApplications(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Notifications
  authPageloadSettingsPControlsNotifications: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageloadSettingsPControlsNotifications(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Friend management
  authPageLoadSettingsPControlsBlockedUsers: wrapEventServiceWithTryCatch((state: string): void => {
    const params = getEventParams.authPageloadSettingsPControlsBlockedUsers(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsPControlsFriendsUserDetail: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsPControlsFriendsUserDetail(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsFriendsViewProfile: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsPControlsFriendsViewProfile(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsFriendsBlock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsPControlsFriendsBlock(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsFriendsReport: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsPControlsFriendsReport(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authModalShownSettingsPControlsFriendsConfirmBlock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authModalShownSettingsPControlsFriendsConfirmBlock(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsFriendsConfirmBlock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsPControlsFriendsConfirmBlock(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsFriendsCancelBlock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsPControlsFriendsCancelBlock(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authModalShownSettingsPControlsFriendsCantBlock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authModalShownSettingsPControlsFriendsCantBlock(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsFriendsUnblock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsPControlsFriendsUnblock(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authModalShownSettingsPControlsFriendsUnblock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authModalShownSettingsPControlsFriendsUnblock(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsFriendsConfirmUnblock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsPControlsFriendsConfirmUnblock(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsFriendsCancelUnblock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, friendUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsPControlsFriendsCancelUnblock(
        parentalControlsFriendState(child, friendUserId),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsBlockedUsersUnblock: wrapEventServiceWithTryCatch(
    (blockedUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsBlockedUsersUnblock(blockedUserId);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsBlockedUsersUnblockVpc: wrapEventServiceWithTryCatch(
    (blockedUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsBlockedUsersUnblockVpc(blockedUserId);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authModalShownSettingsBlockedUsersUnblock: wrapEventServiceWithTryCatch(
    (blockedUserId: number): void => {
      const params = getEventParams.authModalShownSettingsBlockedUsersUnblock(blockedUserId);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsBlockedUsersConfirmUnblock: wrapEventServiceWithTryCatch(
    (blockedUserId: number): void => {
      const params =
        getEventParams.authButtonClickSettingsBlockedUsersConfirmUnblock(blockedUserId);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsBlockedUsersCancelUnblock: wrapEventServiceWithTryCatch(
    (blockedUserId: number): void => {
      const params = getEventParams.authButtonClickSettingsBlockedUsersCancelUnblock(blockedUserId);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Experience management
  authPageLoadSettingsPControlsContentRestrictions: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageLoadSettingsPControlsContentRestrictions(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authPageLoadSettingsPControlsBlockedExperiences: wrapEventServiceWithTryCatch(
    (state: string): void => {
      const params = getEventParams.authPageLoadSettingsPControlsBlockedExperiences(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsBlockedExperiencesEdp: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number, experienceTitle: string): void => {
      const state = parentalControlsExperienceState(child, universeId);
      const params = getEventParams.authButtonClickSettingsPControlsBlockedExperiencesEdp(
        state,
        experienceTitle,
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsBlockedExperiencesUnblock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number): void => {
      const state = parentalControlsExperienceState(child, universeId);
      const params =
        getEventParams.authButtonClickSettingsPControlsBlockedExperiencesUnblock(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authModalShownSettingsPControlsBlockedExperiencesConfirmUnblock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number): void => {
      const state = parentalControlsExperienceState(child, universeId);
      const params =
        getEventParams.authModalShownSettingsPControlsBlockedExperiencesConfirmUnblock(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsBlockedExperiencesConfirmUnblock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number): void => {
      const state = parentalControlsExperienceState(child, universeId);
      const params =
        getEventParams.authButtonClickSettingsPControlsBlockedExperiencesConfirmUnblock(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsBlockedExperiencesCancelUnblock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number): void => {
      const state = parentalControlsExperienceState(child, universeId);
      const params =
        getEventParams.authButtonClickSettingsPControlsBlockedExperiencesCancelUnblock(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authFormInteractionSettingsPControlsBlockedExperiencesSearch: wrapEventServiceWithTryCatch(
    (child: TChildInfo, searchInput: string, sessionId: string): void => {
      const state = `${parentalControlsChildState(child)} ${sessionId}}`;
      const params = getEventParams.authFormInteractionSettingsPControlsBlockedExperiencesSearch(
        state,
        searchInput,
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsBlockedExperiencesBlock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number, sessionId?: string): void => {
      const state = parentalControlsExperienceState(child, universeId, sessionId);
      const params = getEventParams.authButtonClickSettingsPControlsBlockedExperiencesBlock(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authModalShownSettingsPControlsBlockedExperiencesConfirmBlock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number, sessionId?: string): void => {
      const state = parentalControlsExperienceState(child, universeId, sessionId);
      const params =
        getEventParams.authModalShownSettingsPControlsBlockedExperiencesConfirmBlock(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsBlockedExperiencesConfirmBlock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number, sessionId?: string): void => {
      const state = parentalControlsExperienceState(child, universeId, sessionId);
      const params =
        getEventParams.authButtonClickSettingsPControlsBlockedExperiencesConfirmBlock(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsBlockedExperiencesCancelBlock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number, sessionId?: string): void => {
      const state = parentalControlsExperienceState(child, universeId, sessionId);
      const params =
        getEventParams.authButtonClickSettingsPControlsBlockedExperiencesCancelBlock(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authModalShownSettingsPControlsBlockedExperiencesCantBlock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number, sessionId?: string): void => {
      const state = parentalControlsExperienceState(child, universeId, sessionId);
      const params =
        getEventParams.authModalShownSettingsPControlsBlockedExperiencesCantBlock(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // TopGames events - Parent side
  authPageLoadSettingsPControlsTopGames: wrapEventServiceWithTryCatch((state: string): void => {
    const params = getEventParams.authPageLoadSettingsPControlsTopGames(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  // TopGameDetails events - Parent side. State carries the universeId so the
  // detail-page funnel can be correlated with the originating game.
  authPageLoadSettingsPControlsTopGameDetails: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number): void => {
      const state = parentalControlsExperienceState(child, universeId);
      const params = getEventParams.authPageLoadSettingsPControlsTopGameDetails(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsTopExperiencesExperienceDetail: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number): void => {
      const state = parentalControlsExperienceState(child, universeId);
      const params =
        getEventParams.authButtonClickSettingsPControlsTopExperiencesExperienceDetail(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsTopExperiencesEdp: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number, experienceTitle: string): void => {
      const state = parentalControlsExperienceState(child, universeId);
      const params = getEventParams.authButtonClickSettingsPControlsTopExperiencesEdp(
        state,
        experienceTitle,
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsTopExperiencesBlock: wrapEventServiceWithTryCatch(
    (child: TChildInfo, universeId: number): void => {
      const state = parentalControlsExperienceState(child, universeId);
      const params = getEventParams.authButtonClickSettingsPControlsTopExperiencesBlock(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsScreentimeMore: wrapEventServiceWithTryCatch(
    (child: TChildInfo): void => {
      const state = parentalControlsChildState(child);
      const params = getEventParams.authButtonClickSettingsPControlsScreentimeMore(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsConnectionsMore: wrapEventServiceWithTryCatch(
    (child: TChildInfo): void => {
      const state = parentalControlsChildState(child);
      const params = getEventParams.authButtonClickSettingsPControlsConnectionsMore(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsSpendingNotifications: wrapEventServiceWithTryCatch(
    (child: TChildInfo, value: SpendNotificationSetting): void => {
      const state = parentalControlsChildState(child);
      const params = getEventParams.authButtonClickSettingsPControlsSpendingNotifications(
        state,
        value,
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsGiftRobuxOpen: wrapEventServiceWithTryCatch(
    (child: TChildInfo): void => {
      const state = parentalControlsChildState(child);
      const params = getEventParams.authButtonClickSettingsPControlsGiftRobuxOpen(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickSettingsPControlsGiftRobuxCheckout: wrapEventServiceWithTryCatch(
    (child: TChildInfo, productId: number): void => {
      const state = parentalControlsChildState(child);
      const params = getEventParams.authButtonClickSettingsPControlsGiftRobuxCheckout(
        state,
        productId,
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authMsgShownSettingsPControlsGiftRobuxError: wrapEventServiceWithTryCatch(
    (child: TChildInfo, errorType: string): void => {
      const state = parentalControlsChildState(child);
      const params = getEventParams.authMsgShownSettingsPControlsGiftRobuxError(state, errorType);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Age check
  authPageloadSettingsPControlsAgeCheck: wrapEventServiceWithTryCatch((state: string): void => {
    const params = getEventParams.authPageloadSettingsPControlsAgeCheck(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
};

export const sendParentalControlsParentPageloadEvent = (
  pathname: string,
  child: TChildInfo,
  allParentalControlsPages: TSettingsPage[],
): void => {
  // Use `matchPath` so pages with `:param` segments (e.g. `TopGameDetails`)
  // resolve against concrete URLs.
  const page = Object.values(allParentalControlsPages).find(p =>
    matchPath(pathname, { path: p.path, exact: true }),
  );
  if (page) {
    const state = parentalControlsChildState(child);
    switch (page.name) {
      case ParentalControlsPageName.LinkedChildDetails:
        parentalControlsEventService.authPageloadSettingsPControlsChild(state);
        break;
      case ParentalControlsPageName.ConsentCenter:
        parentalControlsEventService.authPageloadSettingsPControlsConsentCenter(state);
        break;
      case ParentalControlsPageName.EditChildProfile:
        parentalControlsEventService.authPageloadSettingsPControlsEditProfile(state);
        break;
      case ParentalControlsPageName.ScreentimeLimit:
        parentalControlsEventService.authPageloadSettingsPControlsScreentime(state);
        break;
      case ParentalControlsPageName.TopGames:
        parentalControlsEventService.authPageLoadSettingsPControlsTopGames(state);
        break;
      case ParentalControlsPageName.TopGameDetails: {
        // `topGameDetailsPage.path` ends in `:universeId`, so the last path
        // segment of the concrete URL is the universe id.
        const universeId = Number(pathname.split("/").pop());
        if (Number.isFinite(universeId)) {
          parentalControlsEventService.authPageLoadSettingsPControlsTopGameDetails(
            child,
            universeId,
          );
        }
        break;
      }
      case ParentalControlsPageName.FriendManagement:
        parentalControlsEventService.authPageloadSettingsPControlsFriends(state);
        break;
      case PrivacySettingName.ContentMaturity:
        parentalControlsEventService.authPageloadSettingsPControlsContentMaturity(state);
        break;
      case PrivacySettingName.SensitiveIssues:
        parentalControlsEventService.authPageloadSettingsPControlsSensitiveIssues(state);
        break;
      case SettingCategoryPageName.Communication:
        parentalControlsEventService.authPageloadSettingsPControlsCommunication(state);
        break;
      case SettingCategoryPageName.ExperienceChat:
        parentalControlsEventService.authPageloadSettingsPControlsExperienceChat(state);
        break;
      case SettingCategoryPageName.Party:
        parentalControlsEventService.authPageloadSettingsPControlsParty(state);
        break;
      case SettingCategoryPageName.VoiceDataUsage:
        parentalControlsEventService.authPageloadSettingsPControlsVoiceDataUsage(state);
        break;
      case SettingCategoryPageName.Spending:
        parentalControlsEventService.authPageloadSettingsPControlsSpending(state);
        break;
      case SpendSettingName.AllowPurchases:
        parentalControlsEventService.authPageloadSettingsPControlsAllowPurchases(state);
        break;
      case SettingCategoryPageName.VisibilityAndPrivateServers:
        parentalControlsEventService.authPageloadSettingsPControlsVisibilityPrivateServers(state);
        break;
      case SettingCategoryPageName.FriendsAndContacts:
        parentalControlsEventService.authPageloadSettingsPControlsDiscoverability(state);
        break;
      case SettingCategoryPageName.Visibility:
        parentalControlsEventService.authPageloadSettingsPControlsVisibility(state);
        break;
      case PrivacySettingName.PrivateServerPrivacy:
        parentalControlsEventService.authPageloadSettingsPControlsPrivateServers(state);
        break;
      case SettingCategoryPageName.TradingAndInventory:
        parentalControlsEventService.authPageloadSettingsPControlsTradingInventory(state);
        break;
      case SettingCategoryPageName.ThirdPartyApplications:
        parentalControlsEventService.authPageloadSettingsPControlsThirdPartyApplications(state);
        break;
      case SettingCategoryPageName.Notifications:
        parentalControlsEventService.authPageloadSettingsPControlsNotifications(state);
        break;
      case PrivacySettingName.BlockedUsers:
        parentalControlsEventService.authPageLoadSettingsPControlsBlockedUsers(state);
        break;
      case SettingCategoryPageName.ContentRestrictions:
        parentalControlsEventService.authPageLoadSettingsPControlsContentRestrictions(state);
        break;
      case PrivacySettingName.BlockedExperiences:
        parentalControlsEventService.authPageLoadSettingsPControlsBlockedExperiences(state);
        break;
      case SettingCategoryPageName.StudioCollaboration:
        parentalControlsEventService.authPageloadSettingsPControlsCreatorCollaboration(state);
        break;
      case SettingCategoryPageName.AgeCheck:
        parentalControlsEventService.authPageloadSettingsPControlsAgeCheck(state);
        break;
      default:
    }
  }
};

export default parentalControlsEventService;
