import React, { useMemo } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { Loading } from "@rbx/core-ui";
import { InlinePrompt } from "@rbx/prompts-orchestrator";
import { SduiPageEntryPoint } from "@rbx/sdui-core/client";
// @ts-expect-error The upsell card is untyped JavaScript.
import HomePageUpsellCardContainerEntry from "../../../js/homePageUpsellCard/App";
import { SessionInfoType } from "../../common/constants/eventStreamConstants";
import { usePageSession } from "../../common/utils/PageSessionContext";
import { GameTileFeedbackErrorSnackbar } from "../../sdui/v2/components/gameTileFeedback/GameTileFeedbackErrorSnackbar";
import { HOME_PAGE_FEED_IDENTIFIER } from "./homePageConfiguration";
import { buildHomePageRequestConfig } from "./fetchHomePageData";
import { buildHomePageEntryPointMessages } from "./homePageEntryPointMessages";
import { getHomePageSduiServices } from "./homePageSduiServices";
import "./homeSduiPage.css";

const HomeSduiEntryPointLoading = (): React.JSX.Element => <Loading />;

export type HomePageContainerV2Props = {
  translate: TranslateFunction;
};

export const HomePageContainerV2 = ({ translate }: HomePageContainerV2Props): React.JSX.Element => {
  const sessionId = usePageSession();
  const statusMessages = useMemo(() => buildHomePageEntryPointMessages(translate), [translate]);
  const services = useMemo(() => getHomePageSduiServices(translate), [translate]);
  const additionalAnalyticsData = useMemo(
    () => ({ [SessionInfoType.HomePageSessionInfo]: sessionId }),
    [sessionId],
  );
  const requestConfig = useMemo(
    () =>
      buildHomePageRequestConfig({
        sessionId,
        contextualFeatures: { request_intent: "logIn" },
      }),
    [sessionId],
  );

  return (
    <div className="home-sdui-page place-list-container" data-testid="home-sdui-page">
      <div className="home-sdui-prompt">
        <InlinePrompt entryPoint="HomepageLaunchWeb" promptStyle="InlineBanner" />
      </div>
      <HomePageUpsellCardContainerEntry translate={translate} context={undefined} />
      <GameTileFeedbackErrorSnackbar translate={translate} />
      <SduiPageEntryPoint
        statusMessages={statusMessages}
        services={services}
        LoadingComponent={HomeSduiEntryPointLoading}
        requestConfig={requestConfig}
        identifiers={{ rootIdentifier: HOME_PAGE_FEED_IDENTIFIER }}
        additionalAnalyticsData={additionalAnalyticsData}
      />
    </div>
  );
};

export default HomePageContainerV2;
