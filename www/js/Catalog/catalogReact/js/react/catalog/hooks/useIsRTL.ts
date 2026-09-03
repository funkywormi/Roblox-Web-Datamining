import { useEffect, useState } from 'react';

function isRTL() {
  const element = document.querySelector('[dir]') as HTMLElement;
  return element ? element.dir === 'rtl' : false;
}

function useIsRTL(): boolean {
  const [rtl, setRTL] = useState(false);

  useEffect(() => {
    setRTL(isRTL());
  }, []);

  return rtl;
}

export default useIsRTL;
