export type PlaceholderWrapperRenderInput = {
  isPlaceholder: boolean;
  hasReal: boolean;
  mountRealDuringPlaceholder: boolean;
  placeholderMounted: boolean;
};

export type PlaceholderWrapperRenderFlags = {
  /** Whether the real subtree should stay in the React tree. */
  shouldRenderReal: boolean;
};

/**
 * Pure render flag for `SduiPlaceholderWrapper`.
 *
 * Mirrors lua `shouldRenderReal = not placeholderMounted or not isPlaceholder
 * or mountRealDuringPlaceholder`, with an extra `hasReal` guard for web.
 */
export function getPlaceholderWrapperRenderFlags(
  input: PlaceholderWrapperRenderInput,
): PlaceholderWrapperRenderFlags {
  const { isPlaceholder, hasReal, mountRealDuringPlaceholder, placeholderMounted } = input;

  return {
    shouldRenderReal:
      hasReal && (!placeholderMounted || !isPlaceholder || mountRealDuringPlaceholder),
  };
}
