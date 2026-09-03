import { buildTagsForLogging } from "./stringBuilderUtils";

/**
 * Prefixes an error message with bracket-wrapped tags for logging, e.g.
 * `[appPage=Communities][promptId=42] boom`.
 */
export const generateErrorMessage = ({
  tags,
  errorMessage,
}: {
  tags: Record<string, string | undefined>;
  errorMessage: string;
}) => {
  const tagsPrefix = buildTagsForLogging(tags);

  return tagsPrefix ? `${tagsPrefix} ${errorMessage}` : errorMessage;
};

/**
 * Use this to extract the error message in a try/catch block
 *
 * @param error - The error received by the catch block
 * @param fallback - The fallback error message if a message could not be
 * extracted from the given error
 */
export const extractErrorMessageFromUnknownError = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
};
