import { DelayParameters } from "./types";

export const hasBypassableMethod = (
  mediaType: string,
  delayParameters: DelayParameters,
): boolean => {
  if (
    !delayParameters?.eligibleMethods?.some(
      eligibleMethod => eligibleMethod.method === mediaType && eligibleMethod.bypassable,
    )
  ) {
    return false;
  }

  return true;
};
