import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const useScrollRestoration = (): void => {
  const location = useLocation();
  const scrollPositions = useRef<Record<string, number>>({});
  const currentPath = useRef<string>(location.pathname);

  useEffect(() => {
    const onScroll = () => {
      scrollPositions.current[currentPath.current] = window.scrollY;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname === currentPath.current) {
      return;
    }

    currentPath.current = location.pathname;

    const savedPosition = scrollPositions.current[location.pathname];
    if (savedPosition !== undefined) {
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition);
      });
    }
  }, [location.pathname]);
};

export default useScrollRestoration;
