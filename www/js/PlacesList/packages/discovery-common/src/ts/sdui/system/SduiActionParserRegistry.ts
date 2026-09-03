import openGameDetailsParser from "./actions/openGameDetailsParser";
import openMusicAssetParser from "./actions/openMusicAssetParser";
import openSeeAllParser from "./actions/openSeeAllParser";
import openSignupParser from "./actions/openSignupParser";
import { TAnalyticsContext, TSduiContext } from "./SduiTypes";

export enum SduiActionType {
  OpenGameDetails = "OpenGameDetails",
  OpenSongDetails = "OpenSongDetails",
  OpenSeeAll = "OpenSeeAll",
  PlayButtonClick = "PlayButtonClick",
  OpenSignup = "OpenSignup",
  OpenJoinFriends = "OpenJoinFriends",
}

export type TSduiActionConfig = {
  actionType: SduiActionType;
  actionParams: Record<string, unknown>;
};

/*
 * External type for parsed action that is passed to SDUI components
 * onActivated: required (since it will at least contain analytics, even for navigation links)
 * linkPath: optional
 */
export type TSduiParsedAction = {
  onActivated: () => void;
  linkPath?: string;
};

/*
 * Internal type for a parsed action that is passed to executeActionWithAnalytics
 * callback: optional (since it may not be needed for analytics-only use cases like navigation links)
 * linkPath: optional
 */
export type TSduiParsedActionConfig = {
  callback?: () => void;
  linkPath?: string;
};

export type TSduiActionParser = (
  actionConfig: TSduiActionConfig,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
) => TSduiParsedActionConfig;

const emptyActionParser = (): TSduiParsedActionConfig => {
  return {
    // Analytics will still be sent by executeAction, but no additional callback is needed
    callback: undefined,
    linkPath: undefined,
  };
};

export const SduiActionParserRegistry: Record<keyof typeof SduiActionType, TSduiActionParser> = {
  [SduiActionType.OpenGameDetails]: openGameDetailsParser,
  [SduiActionType.OpenSongDetails]: openMusicAssetParser,
  [SduiActionType.OpenSeeAll]: openSeeAllParser,
  [SduiActionType.OpenSignup]: openSignupParser,

  // No callback is needed since the client components handle these actions
  [SduiActionType.PlayButtonClick]: emptyActionParser,
  [SduiActionType.OpenJoinFriends]: emptyActionParser,
};

export default SduiActionParserRegistry;
