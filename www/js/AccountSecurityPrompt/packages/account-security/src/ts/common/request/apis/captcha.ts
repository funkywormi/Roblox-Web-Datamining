import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as Captcha from "../types/captcha";

export const getMetadata = (): Promise<
  Result<Captcha.GetMetadataReturnType, Captcha.CaptchaError | null>
> => toResult(http.get(Captcha.GET_METADATA_CONFIG, {}), Captcha.CaptchaError);
