import { useEffect, useState } from 'react';
import useElementHeight from '../../hooks/useElementHeight';

const useSearchFiltersStickyTop = () => {
  const searchBarHeight: number = useElementHeight('search-bars');
  const rbxHeaderHeight: number = useElementHeight('rbx-header');

  const stickyTop = searchBarHeight + rbxHeaderHeight;

  const [searchFiltersStickyTop, setSearchFiltersStickyTop] = useState<number | null>(null);

  useEffect(() => {
    setSearchFiltersStickyTop(stickyTop);
  }, [stickyTop]);

  return { searchFiltersStickyTop };
};

export default useSearchFiltersStickyTop;
