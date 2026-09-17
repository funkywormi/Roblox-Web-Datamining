export const isKeyboardEvent = (
  event: Event | React.SyntheticEvent
): event is React.KeyboardEvent | KeyboardEvent => {
  return 'key' in event;
};

/**
 * Creates a generic event handler that only executes when a predicate is true.
 * @param fn - The function to execute when the predicate is true
 * @param predicate - Function that determines if the handler should execute
 * @param preventDefault - Whether to call preventDefault on the event
 * @param stopPropagation - Whether to call stopPropagation on the event
 * @returns Event handler function
 */
export const createEventHandler = (
  fn: () => void,
  predicate: (event: Event | React.SyntheticEvent) => boolean,
  preventDefault = false,
  stopPropagation = false
): ((event: Event | React.SyntheticEvent) => void) => (
  event: Event | React.SyntheticEvent
): void => {
  if (predicate(event)) {
    if (preventDefault) {
      event.preventDefault();
    }

    if (stopPropagation) {
      event.stopPropagation();
    }

    fn();
  }
};

/**
 * Creates a keyboard event handler that only executes for specific keys.
 * Useful for making UI elements keyboard accessible.
 * @param fn - The function to execute when a matching key is pressed
 * @param keys - Array of key values to listen for (e.g., ['Enter', ' ', 'Spacebar'])
 * @param preventDefault - Whether to call preventDefault on the event
 * @param stopPropagation - Whether to call stopPropagation on the event
 * @returns Keyboard event handler function
 * @example
 * ```typescript
 * const handleKeyDown = createKeyboardEventHandler(
 *   () => console.log('Activated!'),
 *   ['Enter', ' '], // Space key
 *   true // Prevent default behavior
 * );
 * ```
 */
export const createKeyboardEventHandler = (
  fn: () => void,
  keys: string[],
  preventDefault?: boolean,
  stopPropagation?: boolean
): ((event: Event | React.SyntheticEvent) => void) =>
  createEventHandler(
    fn,
    event => {
      if (!isKeyboardEvent(event)) {
        return false;
      }
      return keys.includes(event.key);
    },
    preventDefault,
    stopPropagation
  );
