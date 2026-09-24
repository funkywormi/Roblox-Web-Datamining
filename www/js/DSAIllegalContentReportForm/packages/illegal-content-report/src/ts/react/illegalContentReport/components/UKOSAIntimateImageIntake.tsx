import React from "react";
import { useTranslations } from "../../util/translation";
import { UKOSAIntimateImageStanding } from "../ukOsaIntimateImage";
import Checkbox from "./Checkbox";
import FormField from "./FormField";

interface Props {
  isDeclarationConfirmed: boolean;
  onDeclarationChange: (checked: boolean) => void;
  standing: UKOSAIntimateImageStanding | null;
  onStandingChange: (standing: UKOSAIntimateImageStanding) => void;
  relationshipToDepictedPerson: string;
  onRelationshipChange: (relationship: string) => void;
}

/** Additional intake fields shown when the UK OSA intimate-image category is selected. */
const UKOSAIntimateImageIntake = ({
  isDeclarationConfirmed,
  onDeclarationChange,
  standing,
  onStandingChange,
  relationshipToDepictedPerson,
  onRelationshipChange,
}: Props): React.ReactElement => {
  const { translate } = useTranslations();

  return (
    <div id="uk-osa-intimate-image-intake">
      <div id="uk-osa-intimate-image-standing" className="section">
        <h5>{`${translate("Question.UKOSAIntimateImage.ReporterStanding")}*`}</h5>
        <div className="custom-radio-group">
          <div className="radio-item">
            <input
              id="uk-osa-intimate-image-standing-depicted-person"
              type="radio"
              name="uk_osa_intimate_image_standing"
              checked={standing === UKOSAIntimateImageStanding.DEPICTED_PERSON}
              onChange={() => onStandingChange(UKOSAIntimateImageStanding.DEPICTED_PERSON)}
            />
            <label htmlFor="uk-osa-intimate-image-standing-depicted-person">
              <span>{translate("Label.UKOSAIntimateImage.ReporterStanding.DepictedPerson")}</span>
            </label>
          </div>
          <div className="radio-item">
            <input
              id="uk-osa-intimate-image-standing-authorized-representative"
              type="radio"
              name="uk_osa_intimate_image_standing"
              checked={standing === UKOSAIntimateImageStanding.AUTHORIZED_REPRESENTATIVE}
              onChange={() =>
                onStandingChange(UKOSAIntimateImageStanding.AUTHORIZED_REPRESENTATIVE)
              }
            />
            <label htmlFor="uk-osa-intimate-image-standing-authorized-representative">
              <span>{translate("Label.UKOSAIntimateImage.ReporterStanding.AuthorizedRep")}</span>
            </label>
          </div>
        </div>
      </div>

      {standing === UKOSAIntimateImageStanding.AUTHORIZED_REPRESENTATIVE && (
        <FormField
          id="uk-osa-intimate-image-relationship"
          label={translate("Question.UKOSAIntimateImage.RelationshipToDepictedPerson")}
          value={relationshipToDepictedPerson}
          onUpdate={onRelationshipChange}
          showRequiredStar
        />
      )}

      <Checkbox
        id="uk-osa-intimate-image-declaration"
        checked={isDeclarationConfirmed}
        onChange={onDeclarationChange}
        label={translate("Label.UKOSAIntimateImage.Declaration")}
        className="section"
        required
      />
    </div>
  );
};

export default UKOSAIntimateImageIntake;
