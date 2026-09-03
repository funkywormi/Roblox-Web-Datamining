import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as CaptchaV2 from "../types/captchaV2";

/**
 * Verifies the captcha session for the given GCS challenge. The endpoint is
 * selected from the optional `mode`.
 *
 * On success the session is marked verified and the response carries the
 * redemption token that must be relayed back to GCS. A `403` indicates the
 * caller must still complete the interactive challenge before retrying.
 */
export const submitCaptcha = (
  challengeId: string,
  mode?: CaptchaV2.CaptchaMode,
): Promise<Result<CaptchaV2.SubmitCaptchaV2ReturnType, CaptchaV2.CaptchaV2Error | null>> =>
  toResult(
    http.post(CaptchaV2.getSubmitCaptchaV2Config(mode), {
      // eslint-disable-next-line camelcase
      challenge_id: challengeId,
    } as CaptchaV2.SubmitCaptchaV2Request),
    CaptchaV2.CaptchaV2Error,
  );

/**
 * Extracts block parameters from v2/captcha response.
 */
export const parseBlockResponse = (errorRaw: unknown): CaptchaV2.CaptchaV2BlockResponse | null => {
  if (typeof errorRaw !== "object" || errorRaw === null) {
    return null;
  }

  const { data } = errorRaw as Record<string, unknown>;
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const { appId, jsClientSrc, firstPartyEnabled, vid, uuid, hostUrl, blockScript, blockedUrl } =
    data as Record<string, unknown>;

  if (
    typeof appId !== "string" ||
    typeof jsClientSrc !== "string" ||
    typeof vid !== "string" ||
    typeof uuid !== "string" ||
    typeof hostUrl !== "string" ||
    typeof blockScript !== "string"
  ) {
    return null;
  }

  return {
    appId,
    jsClientSrc,
    firstPartyEnabled: firstPartyEnabled === true,
    vid,
    uuid,
    hostUrl,
    blockScript,
    blockedUrl: typeof blockedUrl === "string" ? blockedUrl : undefined,
  };
};
