import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as ProofOfSpace from "../types/proofOfSpace";

export const verifyPuzzle = async (
  challengeId: string,
  solution: ProofOfSpace.Solution,
): Promise<Result<ProofOfSpace.VerifyPuzzleResponse, ProofOfSpace.ProofOfSpaceError | null>> =>
  toResult(
    http.post(ProofOfSpace.VERIFY_PUZZLE_CONFIG, {
      challengeId,
      solution,
    }),
    ProofOfSpace.ProofOfSpaceError,
  );
