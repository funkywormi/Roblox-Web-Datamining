/**
 * A type representing the current state while solving the puzzle.
 */
export enum AnswerState {
  INITIAL,
  READY_TO_COMPUTE,
  COMPUTING,
  COMPUTING_DONE,
  VERIFIED_CORRECT,
  VERIFIED_INCORRECT,
}
