import type { SduiPageContext } from "@rbx/sdui-core";
import { EventContext } from "@rbx/unified-logging";

const EVENT_CONTEXT_BY_PAGE_NAME: Readonly<Record<string, EventContext>> = {
  homePage: EventContext.Home,
  searchPage: EventContext.SearchPage,
  gamesPage: EventContext.Games,
  sortDetailPageDiscover: EventContext.Games,
  spotlightPage: EventContext.Spotlight,
  songListPage: EventContext.SongList,
  gameDetailPage: EventContext.GameDetail,
  preAuthLandingPage: EventContext.PreAuthLanding,
};

export function getSduiEventContext(pageContext: SduiPageContext): EventContext | "UNKNOWN" {
  return EVENT_CONTEXT_BY_PAGE_NAME[pageContext.pageName] ?? "UNKNOWN";
}
