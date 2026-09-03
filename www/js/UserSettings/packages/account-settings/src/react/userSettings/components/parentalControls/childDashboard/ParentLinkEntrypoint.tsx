import { Button } from "react-style-guide";
import React from "react";
import useHandleParentLinking from "../../../hooks/useHandleParentLinking";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { useGetAccountInfoQuery } from "../../../../apis/legacyAccountSettingsApi";
import useWrappedTranslation from "../../../hooks/useWrappedTranslation";

export const ParentLinkEntrypoint = (): JSX.Element => {
  const { translate } = useWrappedTranslation();

  const handleParentLinking = useHandleParentLinking();

  const { addParentLink } = parentalControlsTranslationConstants;

  const { data: accountInfo } = useGetAccountInfoQuery();

  const description = accountInfo?.UserAbove13
    ? translate(addParentLink.descriptionForTeen)
    : translate(addParentLink.description);

  return (
    <div className="parental-controls-welcome">
      <h3 className="welcome-header font-header-2">{translate(addParentLink.heading)}</h3>
      <p className="text container-header">{description}</p>
      <div className="welcome-btn-wrapper">
        <Button variant={Button.variants.primary} onClick={handleParentLinking}>
          {translate(addParentLink.addParentAction)}
        </Button>
      </div>
    </div>
  );
};

export default ParentLinkEntrypoint;
