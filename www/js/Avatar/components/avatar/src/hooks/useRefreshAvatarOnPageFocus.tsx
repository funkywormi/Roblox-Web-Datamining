import { useState, useEffect } from "react";
import { avatarConstants } from "../constants/avatarConstants";

// Custom hook to handle page focus and idle time
const useRefreshAvatarOnPageFocus = (onIdle: (idleTime: number) => void) => {
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [pageFocused, setPageFocused] = useState(true);

  useEffect(() => {
    let idleInterval: ReturnType<typeof setInterval>;

    // Function to handle page focus change
    const handlePageFocus = () => {
      if (document.hidden) {
        setPageFocused(false);
        // Start idle timer when the page is not focused
        idleInterval = setInterval(() => {
          setIdleSeconds(prev => prev + 1);
        }, 1000); // Increment idle seconds every second
      } else {
        setPageFocused(true);
        clearInterval(idleInterval); // Stop idle timer when page is focused

        if (idleSeconds > avatarConstants.page.idleRefreshTimeInSeconds) {
          onIdle(idleSeconds); // Perform action if idle time exceeds the threshold
        }

        setIdleSeconds(0); // Reset idle time on focus
      }
    };

    document.addEventListener("visibilitychange", handlePageFocus);

    return () => {
      document.removeEventListener("visibilitychange", handlePageFocus);
      clearInterval(idleInterval); // Cleanup interval
    };
  }, [idleSeconds, onIdle]);

  return { pageFocused, idleSeconds };
};

export default useRefreshAvatarOnPageFocus;
