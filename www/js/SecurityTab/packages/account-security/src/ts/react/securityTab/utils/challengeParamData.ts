// ChallengeParamData is a type for data parsed from the

import { continueChallenge } from "../../../common/request/apis/genericChallenge";
import { ChallengeType, interceptChallenge } from "../../challenge/generic";
import { MetricsService } from "../../challenge/generic/services/metricsService";

// 'challenge' query parameter.
export type ChallengeParamData = {
  challengeID: string;
  challengeType: ChallengeType;
  challengeMetadata: string;
  challengeResponse: string;
};

// This is used as an intermediary type to hold the parsed challenge param data.
type RawChallengeParamData = {
  "rblx-challenge-id": string;
  "rblx-challenge-type": string;
  "rblx-challenge-metadata": string;
  "rblx-challenge-response": string;
};

// GetChallengeParamDataFunction is used to parse the base64 'challenge' URL query
// parameter data if it exists and return ChallengeParamData.
type GetChallengeParamDataFunction = () => ChallengeParamData | null;

// ParseChallengeParamStringFunction is an intermediary function that attempts
// to parse the Base64 encoded challengeParamString.
type ParseChallengeParamStringFunction = (
  challengeParamString: string,
) => ChallengeParamData | null;

type IsGenericChallengeTypeFunction = (
  challengeParamData: ChallengeParamData | null,
  genericChallengeType: ChallengeType,
) => boolean;

const parseChallengeParamString: ParseChallengeParamStringFunction = (
  challengeParamString: string,
) => {
  try {
    const rawChallengeParamData = JSON.parse(atob(challengeParamString)) as RawChallengeParamData;
    const challengeParamData = {
      challengeID: rawChallengeParamData["rblx-challenge-id"],
      challengeType: rawChallengeParamData["rblx-challenge-type"] as ChallengeType,
      challengeMetadata: rawChallengeParamData["rblx-challenge-metadata"],
      challengeResponse: rawChallengeParamData["rblx-challenge-response"],
    };
    return challengeParamData;
  } catch (e) {
    console.error("Error parsing challenge query param data", e);
    return null;
  }
};

export const getChallengeParamData: GetChallengeParamDataFunction = () => {
  if (!window || !window.location) {
    return null;
  }
  const urlSearchParams = new URL(window.location.href).searchParams;
  const challengeParamString = urlSearchParams.get("challenge");
  if (!challengeParamString) {
    return null;
  }
  return parseChallengeParamString(challengeParamString);
};

export const isGenericChallengeType: IsGenericChallengeTypeFunction = (
  challengeParamData: ChallengeParamData | null,
  challengeType: ChallengeType,
) => {
  if (!challengeParamData) {
    return false;
  }
  return challengeParamData.challengeType === challengeType;
};

export const renderGenericSpendFriction = async (
  challengeID: string,
  challengeMetadata: string,
  challengeTypeRaw: string,
) => {
  // Ensure that the proper challenge type is passed in.
  if (challengeTypeRaw !== "twostepverification") {
    return;
  }
  try {
    await interceptChallenge({
      retryRequest: (_challengeId, _redemptionMetadataJson) => {
        // Note: Retry request is not valid in this case as
        // the originating request occurred outside of the current window.
        // The request must be retried within its original context, or
        // must rely on previously passed logic for redemption.
        return Promise.resolve();
      },
      containerId: "2sv-popup-container",
      challengeId: challengeID,
      challengeMetadataJsonBase64: challengeMetadata,
      challengeTypeRaw,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
};

export const continueChallengeRenderGenericSpendFriction = async (
  challengeParamData: ChallengeParamData,
  metricsService: MetricsService,
) => {
  // Ensure that the proper challenge type is passed in.
  if (challengeParamData.challengeType !== "forcetwostepverification") {
    return;
  }
  try {
    const result = await continueChallenge(
      challengeParamData.challengeID,
      challengeParamData.challengeType,
      atob(challengeParamData.challengeMetadata),
    );
    if (result.isError) {
      metricsService.fireContinueFailureEvent(challengeParamData.challengeType);
      return;
    }
    await renderGenericSpendFriction(
      result.value.challengeId,
      btoa(result.value.challengeMetadata),
      result.value.challengeType,
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
};
