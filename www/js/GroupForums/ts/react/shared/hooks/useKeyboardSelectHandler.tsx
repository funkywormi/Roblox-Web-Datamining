import { useCallback } from 'react';

const useKeyboardSelectHandler = (
  handler?: (event: React.KeyboardEvent<HTMLElement>) => void
): ((event: React.KeyboardEvent<HTMLElement>) => void) | undefined => {
  const onKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler?.(event);
      }
    },
    [handler]
  );

  return handler ? onKeyPress : undefined;
};

export default useKeyboardSelectHandler;
