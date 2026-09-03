import { useEffect, useState } from 'react';
import useElementHeight from '../../hooks/useElementHeight';

const useMobileSearchOptionsHeight = () => {
  const rbxHeaderHeight: number = useElementHeight('rbx-header') || 0;
  const headingContainerHeight: number = useElementHeight('heading-container') || 0;

  const [mobileSearchOptionsContainerHeight, setMobileSearchOptionsContainerHeight] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!rbxHeaderHeight) {
      return;
    }
    setMobileSearchOptionsContainerHeight(`calc(100% - ${rbxHeaderHeight}px)`);
  }, [rbxHeaderHeight]);

  return { mobileSearchOptionsContainerHeight, rbxHeaderHeight, headingContainerHeight };
};

export default useMobileSearchOptionsHeight;
