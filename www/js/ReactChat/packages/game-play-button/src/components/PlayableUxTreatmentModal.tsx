import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { TPlayableUxTreatmentData } from "../types/playButtonTypes";
import { translations } from "../constants/translations";
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
  translate,
}: TPlayableUxTreatmentModalProps & WithTranslationsProps): React.JSX.Element => {
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

export default withTranslations<TPlayableUxTreatmentModalProps>(
  PlayableUxTreatmentModal,
  translations,
);
