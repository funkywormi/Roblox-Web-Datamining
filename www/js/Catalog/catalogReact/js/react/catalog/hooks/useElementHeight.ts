import { useState, useEffect } from 'react';

const useElementHeight = (className: string): number => {
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const element = document.querySelector(`.${className}`);

    if (!element) {
      return;
    }

    const htmlElement = element as HTMLElement;

    const updateHeight = () => {
      setHeight(htmlElement.offsetHeight);
    };

    // Initial height set
    updateHeight();

    // Create a ResizeObserver instance to observe size changes
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    // Start observing the element
    resizeObserver.observe(htmlElement);

    // eslint-disable-next-line consistent-return
    return () => {
      resizeObserver.disconnect();
    };
  }, [className]);

  return height;
};

export default useElementHeight;
