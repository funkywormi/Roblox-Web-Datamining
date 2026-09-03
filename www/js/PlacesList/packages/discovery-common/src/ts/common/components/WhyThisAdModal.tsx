import { TranslateFunction } from "@rbx/core-scripts/react";
import { Dialog, DialogTitle, DialogContent, DialogBody } from "@rbx/foundation-ui";
import { CommonUIFeatures, FeatureGameDetails } from "../constants/translationConstants";
import SponsoredDisclosureContent from "./SponsoredDisclosureContent";

type TWhyThisAdModalProps = {
  open: boolean;
  onClose: () => void;
  universeId: number;
  payerName?: string;
  sponsoredUserCohort?: string;
  translate: TranslateFunction;
};

const WhyThisAdModal = ({
  open,
  onClose,
  universeId,
  payerName,
  sponsoredUserCohort,
  translate,
}: TWhyThisAdModalProps): JSX.Element | null => {
  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
      size="Medium"
      isModal
      hasMarginBottom
      hasMarginTop
      hasCloseAffordance
      closeLabel={translate(CommonUIFeatures.ActionClose)}
    >
      <DialogContent aria-describedby="why-this-ad-content">
        <DialogBody className="flex flex-col gap-large">
          <DialogTitle className="text-heading-small">
            {translate(FeatureGameDetails.LabelWhyThisAd)}
          </DialogTitle>
          <SponsoredDisclosureContent
            universeId={universeId}
            payerName={payerName}
            sponsoredUserCohort={sponsoredUserCohort}
            translate={translate}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default WhyThisAdModal;
