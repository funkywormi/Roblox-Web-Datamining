import { EventStreamMetadata } from "../constants/eventStreamConstants";
import { parseMaybeStringNumberField } from "./parseMaybeStringNumberField";

export function getGameSetTargetIdMetadata(
  rawValue: string | number | boolean | undefined,
): { [EventStreamMetadata.GameSetTargetId]: number } | Record<string, never> {
  const gameSetTargetId = parseMaybeStringNumberField(rawValue, -1);

  if (gameSetTargetId <= 0) {
    return {};
  }

  return {
    [EventStreamMetadata.GameSetTargetId]: gameSetTargetId,
  };
}
