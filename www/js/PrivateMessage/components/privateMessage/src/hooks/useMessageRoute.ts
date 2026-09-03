import { useCallback, useEffect, useState } from "react";
import { composeQueryString, parseQueryString } from "@rbx/core-scripts/util/url";
import { MESSAGE_TABS } from "../constants";
import type { MessageRoute, MessageTab } from "../types";

const MESSAGE_TAB_VALUES: readonly string[] = [
  MESSAGE_TABS.inbox,
  MESSAGE_TABS.sent,
  MESSAGE_TABS.notifications,
  MESSAGE_TABS.archive,
];

const isMessageTab = (tab: string): tab is MessageTab => MESSAGE_TAB_VALUES.includes(tab);

const parseNumberParam = (value: unknown): number | null => {
  const normalized: unknown = Array.isArray(value) ? value[0] : value;
  if (normalized == null || normalized === "") {
    return null;
  }

  if (typeof normalized !== "string" && typeof normalized !== "number") {
    return null;
  }

  const parsed = Number.parseInt(String(normalized), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const parseMessageRoute = (hash = window.location.hash): MessageRoute => {
  const normalizedHash = hash.startsWith("#!") ? hash.slice(2) : hash.replace(/^#/, "");
  const [rawPath = "/inbox", rawQuery = ""] = normalizedHash.split("?");
  const tabName = rawPath.replace(/^\//, "");
  const query = parseQueryString(rawQuery);
  const page = parseNumberParam(query.page) ?? 1;

  return {
    tab: isMessageTab(tabName) ? tabName : MESSAGE_TABS.inbox,
    page: page > 0 ? page : 1,
    messageIdx: parseNumberParam(query.messageIdx),
    conversationId: parseNumberParam(query.conversationId),
  };
};

export const buildMessageHash = (route: MessageRoute): string => {
  const query = composeQueryString({
    ...(route.page > 1 ? { page: route.page } : {}),
    ...(route.messageIdx != null ? { messageIdx: route.messageIdx } : {}),
    ...(route.conversationId != null ? { conversationId: route.conversationId } : {}),
  });

  return `#!/${route.tab}${query ? `?${query}` : ""}`;
};

export const useMessageRoute = () => {
  const [route, setRouteState] = useState<MessageRoute>(() => parseMessageRoute());

  useEffect(() => {
    const onHashChange = () => {
      setRouteState(parseMessageRoute());
    };

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const setRoute = useCallback((nextRoute: MessageRoute) => {
    const nextHash = buildMessageHash(nextRoute);
    if (window.location.hash === nextHash) {
      setRouteState(nextRoute);
      return;
    }
    window.location.hash = nextHash;
  }, []);

  return { route, setRoute };
};
