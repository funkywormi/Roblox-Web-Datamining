import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import UpsellModal from "./UpsellModal";

type TRestrictedUnplayableModalProps = {
  isModalOpen: boolean;
  closeModal: () => void;
  translate: TranslateFunction;
};

/**
 * Renders a modal that informs the user the experience is unplayable.
 * Only a secondary button is shown, since there is no action the user
 * can take to make the experience playable.
 */
const RestrictedUnplayableModal = ({
  isModalOpen,
  closeModal,
  translate,
}: TRestrictedUnplayableModalProps): React.JSX.Element => (
  <UpsellModal
    titleText={translate("RestrictedUnplayableModal.Label.Title")}
    bodyText={translate("RestrictedUnplayableModal.Label.Body")}
    secondaryButtonText={translate("RestrictedUnplayableModal.Action.Ok")}
    closeLabelText={translate("Action.Close")}
    onSecondaryButtonClick={closeModal}
    isModalOpen={isModalOpen}
    onCloseModal={closeModal}
  />
);

export default RestrictedUnplayableModal;
