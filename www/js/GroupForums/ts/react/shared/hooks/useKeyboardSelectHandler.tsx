import { useCallback } from 'react';

const useKeyboardSelectHandler = (
  handler?: () => void
): ((event: React.KeyboardEvent<HTMLElement>) => void) | undefined => {
  const onKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler?.();
      }
    },
    [handler]
  );

  return handler ? onKeyPress : undefined;
};

export default useKeyboardSelectHandler;
