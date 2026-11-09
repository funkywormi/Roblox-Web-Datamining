import React, { useCallback, useState } from "react";
import { navigateToPlaytestSettings, navigateToUserProfile } from "../utils/playButtonUtils";
import UpsellModal from "../components/UpsellModal";
import { usePlayButtonTranslate } from "./usePlayButtonTranslate";

type TPlaytestUpsell = "settings" | "trustedFriends" | null;

type TUsePlaytestUpsellFlowParams = {
  creatorId?: number;
};

type TUsePlaytestUpsellFlowResult = {
  openUpdatePlaytestSettingsUpsell: () => void;
  openTrustedFriendsPlaytestUpsell: () => void;
  playtestUpsellModals: React.JSX.Element;
};

type TPlaytestUpsellModalsProps = {
  activeUpsell: TPlaytestUpsell;
  closeUpsell: () => void;
  creatorId?: number;
};

const PlaytestUpsellModals = ({
  activeUpsell,
  closeUpsell,
  creatorId,
}: TPlaytestUpsellModalsProps): React.JSX.Element => {
  const translate = usePlayButtonTranslate();
  const cancelText = translate("Action.Cancel") || "Cancel";
  const okayText = translate("Action.OK") || "OK";
  const closeText = translate("Action.Close") || "Close";

  const isSettingsUpsellOpen = activeUpsell === "settings";
  const isTrustedFriendsUpsellOpen = activeUpsell === "trustedFriends";

  return (
    <React.Fragment>
      <UpsellModal
        titleText={translate("Action.Settings") || "Settings"}
        bodyText={
          translate("Message.UpdateSettingsToPlaytest") ||
          "Update your settings to join this Playtest."
        }
        primaryButtonText={translate("Action.OpenSettings") || "Open Settings"}
        secondaryButtonText={cancelText}
        closeLabelText={closeText}
        onPrimaryButtonClick={() => {
          closeUpsell();
          navigateToPlaytestSettings();
        }}
        onSecondaryButtonClick={closeUpsell}
        isModalOpen={isSettingsUpsellOpen}
        onCloseModal={closeUpsell}
        hasCloseAffordance={false}
        orientButtonsVertically
      />
      <UpsellModal
        titleText={translate("TrustedFriend.Label.AddTrustedFriend") || "Add trusted friend"}
        bodyText={
          translate("Message.TrustedFriendsRequiredForPlaytest") ||
          "Add this creator as a trusted friend to join the Playtest."
        }
        primaryButtonText={creatorId !== undefined ? translate("Action.Add") || "Add" : undefined}
        secondaryButtonText={creatorId !== undefined ? cancelText : okayText}
        closeLabelText={closeText}
        onPrimaryButtonClick={
          creatorId !== undefined
            ? () => {
                closeUpsell();
                navigateToUserProfile(creatorId);
              }
            : undefined
        }
        onSecondaryButtonClick={closeUpsell}
        isModalOpen={isTrustedFriendsUpsellOpen}
        onCloseModal={closeUpsell}
        hasCloseAffordance={false}
        orientButtonsVertically
      />
    </React.Fragment>
  );
};

export const usePlaytestUpsellFlow = ({
  creatorId,
}: TUsePlaytestUpsellFlowParams): TUsePlaytestUpsellFlowResult => {
  const [activeUpsell, setActiveUpsell] = useState<TPlaytestUpsell>(null);

  const closeUpsell = useCallback(() => {
    setActiveUpsell(null);
  }, []);

  const openUpdatePlaytestSettingsUpsell = useCallback(() => {
    setActiveUpsell("settings");
  }, []);

  const openTrustedFriendsPlaytestUpsell = useCallback(() => {
    setActiveUpsell("trustedFriends");
  }, []);

  return {
    openUpdatePlaytestSettingsUpsell,
    openTrustedFriendsPlaytestUpsell,
    playtestUpsellModals: (
      <PlaytestUpsellModals
        activeUpsell={activeUpsell}
        closeUpsell={closeUpsell}
        creatorId={creatorId}
      />
    ),
  };
};

export default usePlaytestUpsellFlow;
