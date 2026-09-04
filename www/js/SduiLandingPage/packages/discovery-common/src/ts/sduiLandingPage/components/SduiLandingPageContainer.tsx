import React, { useMemo } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { withPageSession } from "../../common/utils/PageSessionContext";
import { FeatureSduiLandingPage } from "../../common/constants/translationConstants";
import { getPageConfig } from "../sduiLandingPageConfiguration";
import { getSduiLandingPageServices } from "../services/sduiLandingPageServices";
import translationConfig from "../translation.config";
import ErrorPage from "./ErrorPage";
import { SduiLandingPageContainerV2 } from "./SduiLandingPageContainerV2";

export const SduiLandingPageContainer = (props: WithTranslationsProps): React.JSX.Element => {
  const { translate } = props;
  const pathname = window?.location?.pathname ?? "";
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
      {...props}
      pageConfig={pageConfig}
      services={getSduiLandingPageServices(pageConfig.appPage, translate)}
    />
  );
};

export default withPageSession(
  withTranslations(
    SduiLandingPageContainer,
    translationConfig,
  ) as unknown as React.FC<WithTranslationsProps>,
);
