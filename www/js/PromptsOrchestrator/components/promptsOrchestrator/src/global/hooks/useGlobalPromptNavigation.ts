import { unstable_batchedUpdates } from "react-dom";
import { useEffect } from "react";
import { subscribeToUrlChange } from "@rbx/www-common/navigation";
import { stripLocalePrefix } from "@rbx/www-common/locale";
import { useGlobalPromptsStore } from "../store/globalPromptsStore";
import { matchGlobalPromptRouteConfig } from "../utils/globalPromptRouteConfigMatcher";

const syncPromptContextFromPathname = () => {
  const matchedConfig = matchGlobalPromptRouteConfig(stripLocalePrefix(window.location.pathname));
  // needed to prevent zombie-child effect: https://zustand.docs.pmnd.rs/learn/guides/event-handler-in-pre-react-18#calling-actions-outside-a-react-event-handler-in-pre-react-18
  unstable_batchedUpdates(() => {
    useGlobalPromptsStore.getState().setMatchedConfig(matchedConfig);
  });
};

export const useGlobalPromptNavigation = () => {
  useEffect(() => {
    syncPromptContextFromPathname();
    const unsubscribe = subscribeToUrlChange(syncPromptContextFromPathname);

    return () => {
      unsubscribe();
    };
  }, []);
};
