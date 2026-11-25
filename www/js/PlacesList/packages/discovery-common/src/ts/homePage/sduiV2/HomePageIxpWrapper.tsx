import React from "react";
import { Loading } from "@rbx/core-ui";
import experimentConstants from "../../common/constants/experimentConstants";
import useExperimentValues from "../../common/hooks/useExperimentValues";
import HomePageOmniFeed from "../HomePageOmniFeed";
import HomePageV2 from "./HomePageV2";

const homeSduiV2DefaultValues = {
  IsHomeSduiV2Enabled: false,
};

const HomePageIxpWrapper = (): React.JSX.Element => {
  const { ixpData, isLoading } = useExperimentValues(
    experimentConstants.layerNames.homePageWeb,
    homeSduiV2DefaultValues,
  );

  if (isLoading) {
    return <Loading />;
  }

  // withTranslations injects `translate` / `intl` at runtime on the OmniFeed export.
  // @ts-expect-error TODO: old, migrated code
  return ixpData.IsHomeSduiV2Enabled === true ? <HomePageV2 /> : <HomePageOmniFeed />;
};

export default HomePageIxpWrapper;
