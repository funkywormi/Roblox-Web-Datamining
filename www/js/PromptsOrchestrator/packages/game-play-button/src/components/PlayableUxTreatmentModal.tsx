import { TPlayableUxTreatmentData } from "../types/playButtonTypes";
import { usePlayButtonTranslate } from "../hooks/usePlayButtonTranslate";
import UpsellModal from "./UpsellModal";

type TPlayableUxTreatmentModalProps = {
  treatmentData: TPlayableUxTreatmentData;
  isModalOpen: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

const PlayableUxTreatmentModal = ({
  treatmentData,
  isModalOpen,
  onConfirm,
  onDismiss,
}: TPlayableUxTreatmentModalProps): React.JSX.Element => {
  const translate = usePlayButtonTranslate();
  return (
    <UpsellModal
      titleText={treatmentData.titleText}
      bodyText={treatmentData.bodyText}
      primaryButtonText={treatmentData.primaryActionText}
      secondaryButtonText={treatmentData.secondaryActionText}
      closeLabelText={translate("Action.Close")}
      onPrimaryButtonClick={onConfirm}
      onSecondaryButtonClick={onDismiss}
      isModalOpen={isModalOpen}
      onCloseModal={onDismiss}
    />
  );
};

export default PlayableUxTreatmentModal;
