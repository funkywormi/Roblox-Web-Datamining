import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import UpsellModal from "./UpsellModal";

type TSelfUpdateSettingModalProps = {
  isModalOpen: boolean;
  navigateToAccountSettings: () => void;
  closeModal: () => void;
  translate: TranslateFunction;
};

/**
 * Renders a modal that directs the user to Account Settings to update
 * their Content Maturity setting in order to play the experience.
 */
const SelfUpdateSettingModal = ({
  isModalOpen,
  navigateToAccountSettings,
  closeModal,
  translate,
}: TSelfUpdateSettingModalProps): React.JSX.Element => (
  <UpsellModal
    titleText={translate("UpdateMaturitySettingModal.Label.Title")}
    bodyText={translate("UpdateMaturitySettingModal.Label.Body")}
    primaryButtonText={translate("UpdateMaturitySettingModal.Action.GoToSettings")}
    secondaryButtonText={translate("UpdateMaturitySettingModal.Action.Cancel")}
    closeLabelText={translate("Action.Close")}
    onPrimaryButtonClick={navigateToAccountSettings}
    onSecondaryButtonClick={closeModal}
    isModalOpen={isModalOpen}
    onCloseModal={closeModal}
  />
);

export default SelfUpdateSettingModal;
