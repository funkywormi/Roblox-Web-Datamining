import React, { useMemo } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import { withPageSession } from "../../common/utils/PageSessionContext";
import { FeatureSduiLandingPage } from "../../common/constants/translationConstants";
import { getPageConfig } from "../sduiLandingPageConfiguration";
import { getSduiLandingPageServices } from "../services/sduiLandingPageServices";
import ErrorPage from "./ErrorPage";
import { SduiLandingPageContainerV2 } from "./SduiLandingPageContainerV2";

export const SduiLandingPageContainer = (): React.JSX.Element => {
  const { translate, intl } = useTranslation();
  const pathname = browserWindow?.location?.pathname ?? "";
  const pageConfig = useMemo(() => getPageConfig(pathname), [pathname]);

  if (!pageConfig) {
    return (
      <ErrorPage
        translate={translate}
        titleKey={FeatureSduiLandingPage.ErrorPageNotFoundOrDoesNotExist}
        messageKey={FeatureSduiLandingPage.ErrorPageNotFound}
      />
    );
  }

  // `getSduiLandingPageServices` is a keyed singleton lookup, so this returns
  // the same graph on every render for a given surface.
  return (
    <SduiLandingPageContainerV2
      translate={translate}
      intl={intl}
      pageConfig={pageConfig}
      services={getSduiLandingPageServices(pageConfig.appPage, translate)}
    />
  );
};

export default withPageSession(SduiLandingPageContainer);
