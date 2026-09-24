import { useTranslation } from "react-utilities";
import { Button } from "@rbx/foundation-ui";
import OdpTiltedCardsArt from "../shared/OdpTiltedCardsArt";
import useHandleParentLinking from "../../../hooks/useHandleParentLinking";
import useLinkedParentsState from "../../../hooks/useLinkedParentsState";
import useStartOnDeviceParentLinking from "../../../hooks/useStartOnDeviceParentLinking";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

/**
 * Upsell screen prompting users to add a parent. Shown for users without any linked parents.
 * The copy on this screen is based on what experiment variant is active.
 */
export const ParentLinkEntrypointV2 = (): JSX.Element => {
  const { translate } = useTranslation();

  const handleParentLinking = useHandleParentLinking();
  const startOnDeviceParentLinking = useStartOnDeviceParentLinking();
  const { addParentUpsellVariant, canAddOnDeviceParent, canAddRemoteParent } =
    useLinkedParentsState();

  const { addParentLink } = parentalControlsTranslationConstants;

  const heading =
    addParentUpsellVariant !== undefined
      ? addParentLink.upsellVariantHeadings[addParentUpsellVariant]
      : addParentLink.heading;

  return (
    <div className="flex flex-col items-center gap-xlarge padding-y-large">
      <div className="flex flex-col gap-xlarge width-full max-width-[400px]">
        <OdpTiltedCardsArt />
        <div className="flex flex-col gap-small">
          <h3 className="text-title-large content-emphasis">{translate(heading)}</h3>
          <p className="text-body-medium content-default">
            {translate(addParentLink.upsellVariantDescription)}
          </p>
        </div>
        <div className="flex flex-col gap-small">
          {canAddOnDeviceParent && (
            <Button variant="Emphasis" className="width-full" onClick={startOnDeviceParentLinking}>
              {translate(addParentLink.addOnDeviceParentAction)}
            </Button>
          )}
          {canAddRemoteParent && (
            <Button
              variant={canAddOnDeviceParent ? "Standard" : "Emphasis"}
              className="width-full"
              onClick={handleParentLinking}
            >
              {canAddOnDeviceParent
                ? translate(addParentLink.addRemoteParentAction)
                : translate(addParentLink.addParentAction)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentLinkEntrypointV2;
