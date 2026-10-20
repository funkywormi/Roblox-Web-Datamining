import type { SduiPageContext } from "@rbx/sdui-core";
import { EventContext } from "@rbx/unified-logging";

const EVENT_CONTEXT_BY_PAGE_NAME: Readonly<Record<string, EventContext>> = {
  searchPage: EventContext.SearchPage,
};

export function getSduiEventContext(pageContext: SduiPageContext): EventContext | "UNKNOWN" {
  // TODO: Add mappings for other SDUI pages as they adopt components requiring EventContext.
  return EVENT_CONTEXT_BY_PAGE_NAME[pageContext.pageName] ?? "UNKNOWN";
}
