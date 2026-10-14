import React, { useEffect } from "react";
import { Loading } from "react-style-guide";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import SettingsList from "../../../../common/components/routing/SettingsList";
import InformationalScreen from "../../../../common/components/InformationalScreen";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import useOdpSettingsAndPages from "./hooks/useOdpSettingsAndPages";
import useWrappedTranslation from "../../../hooks/useWrappedTranslation";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { btnClickOdpManagedSetting } from "../../../services/eventServices/odpFamilyEventService";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";
import { trackCounter } from "./observability";
import { ParentZoneCounter } from "./observability/eventConstants";

const OdpSettingManagement = (): JSX.Element | null => {
  const { pages, isLoading, isError } = useOdpSettingsAndPages();
  const { translate } = useWrappedTranslation();
  const { data: parentInfo } = useGetParentInfoQuery();
  useEffect(() => {
    if (isError) {
      trackCounter(ParentZoneCounter.SettingsPageLoadFailed, { page: "SettingManagement" });
    }
  }, [isError]);

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return (
      <InformationalScreen descriptionTranslationKey={commonTranslationConstants.unknownError} />
    );
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
        <SettingsList
          subPages={pages}
          isMainMenu
          onSelectPage={pageName => btnClickOdpManagedSetting(pageName, parentInfo?.parents)}
        />
      </PreviewCard>
    </React.Fragment>
  );
};

export default OdpSettingManagement;
