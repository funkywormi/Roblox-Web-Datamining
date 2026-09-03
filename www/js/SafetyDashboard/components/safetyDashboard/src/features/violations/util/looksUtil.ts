/**
 * Parse look id from the given string, expected format: 'looks/{id}'
 * We want to hide the 'looks/' prefix since this term is only used internally
 * Intended for content_type == ContentType.CONTENT_TYPE_LOOK
 */
export const parseLookId = (lookId: string): string => {
  if (lookId.includes("/")) {
    return lookId.split("/")[1] ?? "";
  }
  return lookId;
};
