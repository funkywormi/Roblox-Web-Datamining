import type { Translator } from "@rbx/www-common/i18n";
import * as Games from "../../../../common/request/types/games";
import * as SecurityQuestions from "../../../../common/request/types/securityQuestions";
import * as Thumbnails from "../../../../common/request/types/thumbnails";
import { ErrorCode } from "../interface";

export const WHICH_GAMES_DAYS_DEFAULT = 7;

export const getResources = (
  translate: Translator<"Feature.SecurityQuestions">,
  translateCommon: Translator<"CommonUI.Messages">,
) =>
  ({
    Action: {
      Confirm: translate("Action.Confirm"),
      Continue: translate("Action.Continue"),
      Ok: translateCommon("Action.OK"),
      PickN: (count: number) => translate("Action.PickN", { count }),
      PleaseTryAgain: translate("Action.PleaseTryAgain"),
      Reload: translate("Action.Reload"),
      SelectAllThatApply: translate("Action.SelectAllThatApply"),
    },
    Description: {
      // IMPORTANT: Do not inject user input into this variable; this content is
      // rendered as HTML.
      RegainAccessGeneric: (styledLinkText: string) =>
        translate("Description.RegainAccessGeneric", { styledLinkText }),
      UnknownChoice: translate("Description.UnknownChoice"),
      VerifyYourIdentity: translate("Description.VerifyYourIdentity"),
      WhichGames: translate("Description.WhichGames", { days: WHICH_GAMES_DAYS_DEFAULT }),
      YourPasswordHasBeenReset: translate("Description.YourPasswordHasBeenReset"),
    },
    Header: {
      PleaseConfirmYourIdentity: translate("Header.PleaseConfirmYourIdentity"),
    },
    Message: {
      Error: {
        AnswerIncorrect: translate("Message.Error.AnswerIncorrect"),
        Default: translate("Message.Error.Default"),
        MustPickN: translate("Message.Error.MustPickN"),
        SecurityQuestions: {
          SessionInactive: translate("Message.Error.SecurityQuestions.SessionInactive"),
          UserWasForceReset: translate("Message.Error.SecurityQuestions.UserWasForceReset"),
        },
      },
    },
  }) as const;

export type SecurityQuestionsResources = ReturnType<typeof getResources>;

export const mapChallengeErrorCodeToResource = (
  resources: SecurityQuestionsResources,
  errorCode: ErrorCode,
): string => {
  switch (errorCode) {
    case ErrorCode.USER_WAS_FORCE_RESET:
      return resources.Message.Error.SecurityQuestions.UserWasForceReset;
    case ErrorCode.SESSION_EXPIRED:
      return resources.Message.Error.SecurityQuestions.SessionInactive;
    default:
      return resources.Message.Error.Default;
  }
};

export const mapSecurityQuestionsErrorToResource = (
  resources: SecurityQuestionsResources,
  error: SecurityQuestions.SecurityQuestionsError | null,
): string => {
  switch (error) {
    case SecurityQuestions.SecurityQuestionsError.SESSION_INACTIVE:
      return resources.Message.Error.SecurityQuestions.SessionInactive;
    default:
      return resources.Message.Error.Default;
  }
};

export const mapSecurityQuestionsErrorToChallengeErrorCode = (
  error: SecurityQuestions.SecurityQuestionsError | null,
): ErrorCode => {
  switch (error) {
    case SecurityQuestions.SecurityQuestionsError.SESSION_INACTIVE:
      return ErrorCode.SESSION_EXPIRED;
    default:
      return ErrorCode.UNKNOWN;
  }
};

export const mapGamesErrorToResource = (
  resources: SecurityQuestionsResources,
  error: Games.GamesError | null,
): string => {
  switch (error) {
    default:
      return resources.Message.Error.Default;
  }
};

export const mapThumbnailsErrorToResource = (
  resources: SecurityQuestionsResources,
  error: Thumbnails.ThumbnailsError | null,
): string => {
  switch (error) {
    default:
      return resources.Message.Error.Default;
  }
};
