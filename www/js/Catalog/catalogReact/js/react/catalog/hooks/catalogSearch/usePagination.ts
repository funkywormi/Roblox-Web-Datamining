import { useCallback, useState } from 'react';

const usePagination = () => {
  const [startPaging, setStartPaging] = useState<boolean>(false);
  const [nextPageCursor, setNextPageCursor] = useState<string | null>(null);

  const resetPagination = useCallback(() => {
    setStartPaging(false);
    setNextPageCursor(null);
  }, []);

  return {
    startPaging,
    setStartPaging,
    nextPageCursor,
    setNextPageCursor,

    resetPagination
  };
};

export default usePagination;
