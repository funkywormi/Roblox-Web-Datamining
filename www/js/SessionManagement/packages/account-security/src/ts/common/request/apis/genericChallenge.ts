import transport from "../requestTransport";
import { Result } from "../../result";
import { toResult } from "../common";
import * as GenericChallenge from "../types/genericChallenge";

export const continueChallenge = async (
  challengeId: string,
  challengeType: string,
  challengeMetadata: string,
): Promise<
  Result<
    GenericChallenge.ContinueChallengeReturnType,
    GenericChallenge.GenericChallengeError | null
  >
> =>
  toResult(
    transport.post(GenericChallenge.CONTINUE_CHALLENGE_CONFIG, {
      challengeId,
      challengeType,
      challengeMetadata,
    }),
    GenericChallenge.GenericChallengeError,
  );
