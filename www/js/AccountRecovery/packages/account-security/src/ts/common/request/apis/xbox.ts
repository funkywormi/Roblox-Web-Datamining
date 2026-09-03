import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as Xbox from "../types/xbox";

export const getXboxConnection = (): Promise<
  Result<Xbox.getXboxConnectionReturnType, Xbox.XboxError | null>
> => toResult(http.get(Xbox.GET_XBOX_CONNECTION_CONFIG, {}), Xbox.XboxError);

export const disconnectXbox = (): Promise<
  Result<Xbox.disconnectXboxReturnType, Xbox.XboxError | null>
> => toResult(http.post(Xbox.DISCONNECT_XBOX_CONFIG, {}), Xbox.XboxError);
