import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as CaptchaV2 from "../types/captchaV2";

/**
 * Verifies the captcha session for the given GCS challenge via `POST v2/captcha`.
 *
 * On success the session is marked verified and the response carries the
 * redemption token that must be relayed back to GCS. A `403` indicates the
 * caller must still complete the interactive challenge before retrying.
 */
export const submitCaptcha = (
  challengeId: string,
): Promise<Result<CaptchaV2.SubmitCaptchaV2ReturnType, CaptchaV2.CaptchaV2Error | null>> =>
  toResult(
    http.post(CaptchaV2.SUBMIT_CAPTCHA_V2_CONFIG, {
      // eslint-disable-next-line camelcase
      challenge_id: challengeId,
    } as CaptchaV2.SubmitCaptchaV2Request),
    CaptchaV2.CaptchaV2Error,
  );
