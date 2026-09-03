import { SheetRoot, SheetContent, SheetTitle, SheetBody } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { translateHtml } from "@rbx/translation-utils";
import StatusProgressBar from "./StatusProgressBar";
import { COMMUNITY_STANDARDS_URL } from "../../shared/url";

interface StatusExplainerSheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Explains every status level in the progress bar for the user. Also lets the
 * user know how the whole "account status" system works so that they know how they can
 * improve (or learn how to avoid getting banned in general).
 */
const StatusExplainerSheet = ({ open, onClose }: StatusExplainerSheetProps) => {
  const { translate } = useTranslation();

  return (
    <SheetRoot
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}
    >
      <SheetContent closeLabel="Close" centerSheetSize="Medium">
        <SheetTitle>{translate("Heading.StatusExplanationSheet")}</SheetTitle>
        <SheetBody className="flex flex-col gap-large padding-top-medium padding-bottom-xlarge">
          <StatusProgressBar fullSpectrum />

          <p className="text-body-medium content-default margin-none">
            {translate("Description.StatusExplanationSheet.First")}
          </p>

          <div className="flex flex-col gap-xsmall">
            <h3 className="text-title-medium content-emphasis margin-none">
              {translate("Title.ImproveAccountStatus")}
            </h3>
            <p className="text-body-medium content-default margin-none">
              {translateHtml(translate, "Description.ImproveAccountStatus", [
                {
                  opening: "startLink",
                  closing: "endLink",
                  render: children => (
                    <a
                      href={COMMUNITY_STANDARDS_URL}
                      className="content-default underline"
                      /**
                       * The default styling makes the underline too close to the text itself compared to the design we use in Figma.
                       * We need this custom styling since there's no existing Foundatation Tailwind tag for this.
                       */
                      style={{ textUnderlineOffset: "3px" }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                },
              ])}
            </p>
          </div>
        </SheetBody>
      </SheetContent>
    </SheetRoot>
  );
};

export default StatusExplainerSheet;
