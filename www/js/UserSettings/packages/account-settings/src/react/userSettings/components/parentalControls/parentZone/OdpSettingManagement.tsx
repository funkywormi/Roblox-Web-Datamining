import React from "react";
import { Loading } from "react-style-guide";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import SettingsList from "../../../../common/components/routing/SettingsList";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import useOdpSettingsAndPages from "./hooks/useOdpSettingsAndPages";
import useWrappedTranslation from "../../../hooks/useWrappedTranslation";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";

const OdpSettingManagement = (): JSX.Element | null => {
  const { pages, isLoading, isError } = useOdpSettingsAndPages();
  const { translate } = useWrappedTranslation();

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <div role="alert">{translate(commonTranslationConstants.unknownError)}</div>;
  }
  if (Object.keys(pages).length === 0) {
    return null;
  }
  return (
    <React.Fragment>
      <div className="rbx-divider" />
      <PreviewCard
        title={translate(parentalControlsTranslationConstants.settingManagement.heading)}
      >
        <SettingsList subPages={pages} isMainMenu />
      </PreviewCard>
    </React.Fragment>
  );
};

export default OdpSettingManagement;
