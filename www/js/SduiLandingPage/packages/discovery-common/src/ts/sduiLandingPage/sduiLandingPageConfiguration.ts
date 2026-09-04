import { Url } from "@rbx/core-lib/url";
import { SpotlightPageResponseSchema, PreAuthLandingPageResponseSchema } from "@rbx/sdui-core";
import bedev2Constants from "../common/constants/bedev2Constants";
import { PageContext } from "../common/types/pageContext";
import type {
  ISduiLandingPageConfiguration,
  ISduiLandingPageConfigurationBase,
  ISduiLandingPageConfigurationParsed,
} from "./types/sduiLandingPageTypes";
import { buildPreAuthLandingOptionFilterUrl } from "./utils/preAuthLandingPageHelpers";
import { LOCALE_PREFIX_SOURCE } from "./utils/localePathPrefix";

const SDUIPageConfig: ISduiLandingPageConfigurationBase[] = [
  {
    appPage: PageContext.SpotlightPage,
    urlRouteTemplates: ["/spotlight/{spotlightSlug}"],
    buildConfigKey: slug => `spotlight_${slug}`,
    buildRequestUrl: (slug, sessionId) => {
      const { url } = bedev2Constants.url.getSpotlightData();
      const query = `pageSlug=${encodeURIComponent(slug)}${
        sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : ""
      }`;
      return Url.parse(`${url}?${query}`).getOrThrow();
    },
    protoSchema: SpotlightPageResponseSchema,
    responseFormat: "protobuf",
    htmlPayloadId: "landing-page-api-response",
    containerElementIds: ["sdui-landing-page-main-content", "sdui-landing-page-web-app"],
    entryPoints: [{ identifier: "page_header" }, { identifier: "vertical_feed" }],
  },
  {
    appPage: PageContext.PreAuthLandingPage,
    urlRouteTemplates: ["/PreAuthLandingPage", "/preauthlandingpage", "/"],
    buildConfigKey: () => `preauthlandingpage`,
    buildRequestUrl: (_slug, sessionId) => {
      const { url } = bedev2Constants.url.getPreAuthLandingPage();
      const requestUrl = Url.parse(url).getOrThrow();
      return sessionId ? requestUrl.withSearchParams({ sessionId }) : requestUrl;
    },
    buildTargetedRefreshUrl: buildPreAuthLandingOptionFilterUrl,
    protoSchema: PreAuthLandingPageResponseSchema,
    responseFormat: "protobuf", // TODO (sshetty): change to "protobuf" after dev complete
    htmlPayloadId: "landing-page-api-response",
    containerElementIds: ["react-landing-container"],
    entryPoints: [
      { identifier: "page_header" },
      { identifier: "vertical_feed" },
      { identifier: "sticky_header" },
    ],
    dataFetchErrorFallback: {
      type: "redirect",
      url: "/CreateAccount",
      replaceHistory: true,
    },
  },
];

const buildRoutePatternRegex = (urlRouteTemplate: string): RegExp => {
  const pattern = urlRouteTemplate
    .replace(/^\//, "") // Drop leading slash so the locale prefix owns it
    .replace(/\{([^}]+)\}/g, "([^/]+)") // Replace {param} with regex capture group
    .replace(/\//g, "\\/"); // Escape forward slashes

  // Add optional locale prefix pattern (e.g. /ko-kr/, /es, /us-en/, etc.).
  const localizedPattern = `^/(?:${LOCALE_PREFIX_SOURCE})?${pattern}$`;

  return new RegExp(localizedPattern);
};

const SDUIPageConfigParsed: ISduiLandingPageConfigurationParsed[] = SDUIPageConfig.map(config => {
  return {
    ...config,
    routePatternRegexes: config.urlRouteTemplates.map(buildRoutePatternRegex),
  };
});

export const getPageConfig = (url: string): ISduiLandingPageConfiguration | undefined => {
  for (const pageConfig of SDUIPageConfigParsed) {
    for (const routePatternRegex of pageConfig.routePatternRegexes) {
      const routeMatch = routePatternRegex.exec(url);
      if (routeMatch) {
        return {
          ...pageConfig,
          url,
          pageSlug: routeMatch[1] ?? "",
        };
      }
    }
  }

  return undefined;
};

export const getSduiLandingPageContainerElement = (
  url: string,
  pageDocument: Pick<Document, "getElementById"> = document,
): HTMLElement | undefined => {
  const pageConfig = getPageConfig(url);
  if (!pageConfig) {
    return undefined;
  }

  const containerElement = pageConfig.containerElementIds.reduce<HTMLElement | null>(
    (resolvedElement, elementId) => resolvedElement ?? pageDocument.getElementById(elementId),
    null,
  );

  return containerElement ?? undefined;
};

export default { getPageConfig, getSduiLandingPageContainerElement };
