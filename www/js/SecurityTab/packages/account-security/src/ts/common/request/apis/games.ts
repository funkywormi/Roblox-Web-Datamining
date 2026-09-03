import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as Games from "../types/games";

export const getDetailsForUniverseIds = (
  universeIds: string[],
): Promise<Result<Games.GetDetailsForUniverseIdsReturnType, Games.GamesError | null>> =>
  toResult(http.get(Games.GET_DETAILS_FOR_UNIVERSE_IDS_CONFIG, { universeIds }), Games.GamesError);
