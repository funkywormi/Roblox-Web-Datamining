import { HttpResponseCodes, parseErrorCode } from "@rbx/core-scripts/http";
import { itemDetailsConstants } from "../constants/itemDetailsConstants";

const httpStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }
  const { status } = error;
  return typeof status === "number" ? status : undefined;
};

// httpService rejects with the Axios response, so the catalog code is on `data.errors`
// rather than `errors`. A 404 with no body is still a missing item. parseErrorCode throws
// when the rejection is null.
export const isMissingItemDetailsError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  return (
    parseErrorCode(error) === itemDetailsConstants.errorCodes.itemNotFound ||
    httpStatus(error) === HttpResponseCodes.notFound
  );
};
