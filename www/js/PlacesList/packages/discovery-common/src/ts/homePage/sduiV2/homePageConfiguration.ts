import { HomePageResponseSchema } from "@rbx/sdui-core";
import { PageContext } from "../../common/types/pageContext";

/** Matches lua-apps `HomeConstants.ConfigKey`. */
export const HOME_PAGE_CONFIG_KEY = "Home";

/** Matches lua-apps `HomeConstants.ContentIdentifier` / gateway `HomePageFeedIdentifier`. */
export const HOME_PAGE_FEED_IDENTIFIER = "home_page_feed";

export const HOME_APP_PAGE = PageContext.HomePage;

export const homePageSduiConfig = {
  responseFormat: "protobuf" as const,
  pageProtoSchema: HomePageResponseSchema,
  surfaceKey: HOME_APP_PAGE,
  configKey: HOME_PAGE_CONFIG_KEY,
  feedIdentifier: HOME_PAGE_FEED_IDENTIFIER,
};

export const getHomePageKey = (): string => HOME_PAGE_CONFIG_KEY;

export const getHomePageSurfaceKey = (): string => HOME_APP_PAGE;
