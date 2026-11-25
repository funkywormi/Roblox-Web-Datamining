import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { PageContext } from "../../common/types/pageContext";
import { useVerticalScrollTracker } from "../../common/components/useVerticalScrollTracker";
import { withPageSession } from "../../common/utils/PageSessionContext";
import { HomePageContainerV2 } from "./HomePageContainerV2";

export const HomePageV2 = (): React.JSX.Element => {
  const { translate } = useTranslation();
  useVerticalScrollTracker(PageContext.HomePage);

  return <HomePageContainerV2 translate={translate} />;
};

export default withPageSession(HomePageV2);
