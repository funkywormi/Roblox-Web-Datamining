import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as Rostile from "../types/rostile";

export const verifyPuzzle = async (
  challengeId: string,
  solution: Rostile.Solution,
): Promise<Result<Rostile.VerifyPuzzleReturnType, Rostile.RostileError | null>> =>
  toResult(
    http.post(Rostile.VERIFY_PUZZLE_CONFIG, {
      challengeId,
      solution,
    }),
    Rostile.RostileError,
  );
