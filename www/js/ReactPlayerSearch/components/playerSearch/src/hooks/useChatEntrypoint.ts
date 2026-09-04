import { useEffect, useState } from "react";
import { isChatEntrypointEnabled } from "../services/playerSearchService";

export const useChatEntrypoint = () => {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    isChatEntrypointEnabled()
      .then(enabled => {
        if (isMounted) {
          setIsEnabled(enabled);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsEnabled(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return isEnabled;
};
