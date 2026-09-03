import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import getDirectoryFromPath from "../../../../core/utils/routingUtils";
import commonTranslationConstants from "../../../userSettings/constants/contentConstants/commonTranslationConstants";
import parentalControlsConstants from "../../../userSettings/constants/parentalControls/parentalControlsConstants";
import { TEnableBackLinkInterruptEvent } from "../../../userSettings/utils/backLinkUtils";
import useSettingsModal from "../../hooks/modals/useSettingsModal";
import parentalControlsTranslationConstants from "../../../userSettings/constants/contentConstants/parentalControlsTranslationConstants";
import privacyEventService from "../../../userSettings/services/eventServices/privacyEventService";
import useWrappedTranslation from "../../../userSettings/hooks/useWrappedTranslation";

interface BackLinkProps {
  currentPagePath: string | undefined;
  basePath: string;
  titleTranslationKey: string | undefined;
  title?: string;
}

const BackLink: React.FC<BackLinkProps> = ({
  currentPagePath,
  basePath,
  titleTranslationKey,
  title: rawTitle,
}) => {
  const { translate } = useWrappedTranslation();
  const history = useHistory();

  const displayTitle = rawTitle ?? (titleTranslationKey ? translate(titleTranslationKey) : "");

  const pageToLinkTo = currentPagePath ? getDirectoryFromPath(currentPagePath) : basePath;

  // Whether to enable a modal interrupting when the user clicks the back link
  // This is used to prevent accidental navigation away from the page if the user has not yet asked for parent permission
  const [backLinkInterruptEnabled, setBackLinkInterruptEnabled] = useState(false);
  const [backLinkInterruptAction, setBackLinkInterruptAction] = useState<() => void>(() => {
    // empty
  });
  const [settingName, setSettingName] = useState<string>("");

  const [backLinkInterruptModal, backLinkInterruptModalService] = useSettingsModal({
    titleResourceId: parentalControlsTranslationConstants.requestNotSent.title,
    bodyResourceId: parentalControlsTranslationConstants.requestNotSent.description,
    actionButtonTextResourceId: parentalControlsTranslationConstants.parentalConsents.askMyParent,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    size: "sm",
    onAction: () => {
      privacyEventService.authButtonClickBackLinkInterruptParentAskNow(settingName);
      backLinkInterruptAction();
      setBackLinkInterruptEnabled(false);
    },
    onNeutral: () => {
      privacyEventService.authButtonClickRejectBackLinkInterruptParentAsk(settingName);
      setBackLinkInterruptEnabled(false);
      history.push(pageToLinkTo);
    },
  });

  const handleBackLinkInterrupt = (event: CustomEvent<TEnableBackLinkInterruptEvent>) => {
    if (event.type === parentalControlsConstants.disableBackLinkInterruptEventName) {
      setBackLinkInterruptEnabled(false);
      setBackLinkInterruptAction(() => {
        // empty
      });
      setSettingName("");
    } else if (event.type === parentalControlsConstants.enableBackLinkInterruptEventName) {
      setBackLinkInterruptEnabled(true);
      setBackLinkInterruptAction(() => event.detail.onAction);
      setSettingName(event.detail.settingName);
    }
  };

  useEffect(() => {
    window.addEventListener(
      parentalControlsConstants.disableBackLinkInterruptEventName,
      handleBackLinkInterrupt as EventListener,
    );
    window.addEventListener(
      parentalControlsConstants.enableBackLinkInterruptEventName,
      handleBackLinkInterrupt as EventListener,
    );

    return () => {
      window.removeEventListener(
        parentalControlsConstants.disableBackLinkInterruptEventName,
        handleBackLinkInterrupt as EventListener,
      );
      window.removeEventListener(
        parentalControlsConstants.enableBackLinkInterruptEventName,
        handleBackLinkInterrupt as EventListener,
      );
    };
  }, []);

  const onClick = backLinkInterruptEnabled
    ? () => {
        privacyEventService.authModalShownSettingsParentRequestNotSent(settingName);
        backLinkInterruptModalService.open();
      }
    : undefined;

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Backspace") {
      onClick?.();
    }
  };

  const innerComponent = (
    <span
      onClick={onClick}
      className="icon-left"
      role="button"
      aria-label={displayTitle}
      tabIndex={0}
      onKeyPress={handleKeyPress}
    />
  );

  return (
    <React.Fragment>
      <h3 className="back-link font-header-2">
        {backLinkInterruptEnabled ? (
          innerComponent
        ) : (
          <Link to={pageToLinkTo}>{innerComponent}</Link>
        )}
        {displayTitle}
      </h3>
      {backLinkInterruptModal}
    </React.Fragment>
  );
};

export default BackLink;
