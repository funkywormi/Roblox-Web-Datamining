/**
 * Generates a new run ID for the abuse report dialog.
 * This is used to tie events together for a single open to close for the dialog.
 */
export const getNewRunId = (): string => {
  const length = 8;
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
};
