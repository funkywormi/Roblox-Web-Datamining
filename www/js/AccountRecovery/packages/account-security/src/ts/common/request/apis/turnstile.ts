import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as Turnstile from "../types/turnstile";

/**
 * Fetches the Turnstile site key from `turnstile-service`, which is necessary
 * to render the Turnstile widget. The site key is resolved from the session, so
 * the challenge ID must be supplied as a query parameter.
 */
export const getMetadata = (
  challengeId: string,
): Promise<Result<Turnstile.GetTurnstileMetadataReturnType, Turnstile.TurnstileError | null>> =>
  toResult(
    http.get(Turnstile.GET_TURNSTILE_METADATA_CONFIG, {
      // eslint-disable-next-line camelcase
      challenge_id: challengeId,
    }),
    Turnstile.TurnstileError,
  );
