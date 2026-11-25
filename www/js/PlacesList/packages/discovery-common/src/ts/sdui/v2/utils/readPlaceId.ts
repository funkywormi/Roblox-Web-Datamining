import { parseMaybeStringNumberField } from "../../utils/analyticsParsingUtils";

export function readPlaceId(actionParams: Record<string, unknown>): number | undefined {
  const rawPlaceId = actionParams.placeId ?? actionParams.place_id;
  const parsedPlaceId = parseMaybeStringNumberField(
    rawPlaceId as string | number | boolean | undefined,
    -1,
  );

  if (parsedPlaceId !== -1) {
    return parsedPlaceId;
  }

  return undefined;
}
