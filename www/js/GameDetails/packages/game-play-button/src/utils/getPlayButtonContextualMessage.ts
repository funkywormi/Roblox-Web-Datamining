import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import playButtonConstants, { FeatureExperienceDetails } from "../constants/playButtonConstants";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import { TPlayabilityStatus } from "../types/playButtonTypes";
import { shouldShowUnplayableButton } from "./playButtonUtils";

export type ContextualMessageParams = {
  playabilityStatus: TPlayabilityStatus | undefined;
  shouldShowVpcPlayButtonUpsells: boolean | undefined;
  shouldShowNoticeAgreementIfPlayable?: boolean;
  unplayableDisplayText?: string | null;
};

export type ContextualMessageResult = {
  message: string;
  testId: (typeof ContextualMessageTestId)[keyof typeof ContextualMessageTestId];
};

export const ContextualMessageTestId = {
  PlayContextualMessage: "play-contextual-message",
  PlayServerMessage: "play-server-message",
  PlayError: "play-error",
} as const;

export const getPlayButtonContextualMessage = (
  translate: TranslateFunction,
  {
    playabilityStatus,
    shouldShowVpcPlayButtonUpsells,
    shouldShowNoticeAgreementIfPlayable,
    unplayableDisplayText,
  }: ContextualMessageParams,
): ContextualMessageResult | undefined => {
  if (playabilityStatus === undefined) {
    return undefined;
  }

  // Priority 1: These take top priority over BE-supplied text because they are needed
  // for compliance reasons, and the BE does not have access to the
  // client-side info needed to determine if these strings should be shown
  if (playabilityStatus === PlayabilityStatus.Playable && shouldShowNoticeAgreementIfPlayable) {
    return {
      message: translate(FeatureExperienceDetails.PlayButtonMessageAgreeToNotice),
      testId: ContextualMessageTestId.PlayContextualMessage,
    };
  }

  // Priority 2: BE-supplied text
  if (unplayableDisplayText) {
    return {
      message: unplayableDisplayText,
      testId: ContextualMessageTestId.PlayServerMessage,
    };
  }

  // Priority 3: Client fallback for known unplayable statuses
  if (
    // These are unplayable statuses, but they should not have client fallback messages
    playabilityStatus !== PlayabilityStatus.ContextualPlayabilityCoreGated &&
    shouldShowUnplayableButton(playabilityStatus, shouldShowVpcPlayButtonUpsells)
  ) {
    const { playButtonErrorStatusTranslationMap } = playButtonConstants;
    const message = Object.hasOwn(playButtonErrorStatusTranslationMap, playabilityStatus)
      ? translate(playButtonErrorStatusTranslationMap[playabilityStatus])
      : translate(playButtonErrorStatusTranslationMap[PlayabilityStatus.UnplayableOtherReason]);
    return { message, testId: ContextualMessageTestId.PlayError };
  }

  return undefined;
};
