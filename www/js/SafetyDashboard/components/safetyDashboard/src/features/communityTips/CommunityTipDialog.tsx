import {
  Dialog,
  DialogContent,
  DialogHeroMedia,
  DialogBody,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import type { RecommendedRule } from "../../types/api";
import TipIcon from "./TipIcon";

const BULLET = "•";

interface CommunityTipDialogProps {
  open: boolean;
  onClose: () => void;
  tip?: RecommendedRule;
}

/**
 * Splits translated copy on newlines, trimming each line and dropping empties. Policy education
 * descriptions and bullet lists are authored as a single newline-separated string in Translations
 * Hub, so we split them into individual paragraphs/bullets for rendering.
 */
const splitByNewlines = (text: string): string[] =>
  text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

/**
 * A dialog that displays a single community tip (i.e. a single Roblox Community Standard policy with an explanation).
 * The content arrives as a resolved `RecommendedRule` that originates either from the backend
 * recommended-rules endpoint or the localized hardcoded fallback.
 */
const CommunityTipDialog = ({ open, onClose, tip }: CommunityTipDialogProps) => {
  const { translate } = useTranslation();

  if (!tip) {
    return null;
  }

  const descriptionLines = splitByNewlines(tip.ruleDescription);
  const bulletLines = tip.ruleDescriptionBullets ? splitByNewlines(tip.ruleDescriptionBullets) : [];

  return (
    <Dialog
      open={open}
      onOpenChange={openDialog => {
        if (!openDialog) onClose();
      }}
      isModal
      size="Medium"
      type="Default"
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
    >
      <DialogContent>
        <DialogHeroMedia className="height-[200px] flex items-center justify-center bg-surface-200">
          <TipIcon imageName={tip.imageName} />
        </DialogHeroMedia>

        <DialogBody className="flex flex-col gap-large">
          <DialogTitle className="flex flex-col gap-xxsmall">
            <span className="text-heading-small content-emphasis">{tip.ruleTitle}</span>
            <span className="text-body-medium content-default">{tip.ruleSubtitle}</span>
          </DialogTitle>

          <div className="flex flex-col gap-medium">
            {descriptionLines.map(paragraph => (
              <p key={paragraph} className="text-body-medium content-default">
                {paragraph}
              </p>
            ))}

            {bulletLines.length > 0 && (
              <div className="flex flex-col gap-xsmall padding-left-small">
                {bulletLines.map(line => (
                  <div key={line} className="flex flex-row gap-small">
                    <p className="text-body-medium content-default">{BULLET}</p>
                    <p className="text-body-medium content-default">{line}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(tip.importanceTitle || tip.importanceDescription) && (
            <div className="flex flex-col">
              <h4 className="text-title-medium content-emphasis margin-none">
                {tip.importanceTitle}
              </h4>
              <p className="text-body-medium content-default">{tip.importanceDescription}</p>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityTipDialog;
