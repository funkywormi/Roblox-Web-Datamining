import transport from "../requestTransport";
import { Result } from "../../result";
import { toResult } from "../common";
import * as Rostile from "../types/rostile";

export const verifyPuzzle = async (
  challengeId: string,
  solution: Rostile.Solution,
): Promise<Result<Rostile.VerifyPuzzleReturnType, Rostile.RostileError | null>> =>
  toResult(
    transport.post(Rostile.VERIFY_PUZZLE_CONFIG, {
      challengeId,
      solution,
    }),
    Rostile.RostileError,
  );
