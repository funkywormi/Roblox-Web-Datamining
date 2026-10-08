import * as http from "@rbx/core-scripts/http";
import { toResult } from "../common";
import {
  LegacyAccountInfoError,
  LegacyAccountInfoResponse,
  LegacyAccountInfoUrlConfig,
} from "../types/legacyAccountInfo";
import { Result } from "../../result";

export const getAccountInfo = (): Promise<
  Result<LegacyAccountInfoResponse, LegacyAccountInfoError | null>
> => toResult(http.get(LegacyAccountInfoUrlConfig), LegacyAccountInfoError);
