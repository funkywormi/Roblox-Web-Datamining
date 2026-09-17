import React, { useMemo } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Icon,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetRoot,
  SheetTitle,
} from "@rbx/foundation-ui";
import { isMobile as detectMobile } from "../utils/tradesUtils";

export type TradeAgeCheckPromptProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onContinue: () => void;
};

/**
 * Artwork and copy, shared by both presentations. The heading carries the copy
 * visually while the surrounding title supplies the accessible name, so the
 * artwork can sit above the copy as the design asks without a title row
 * splitting them; the heading is hidden from assistive tech to avoid repeating
 * what the title already announces.
 */
const AgeCheckContent = ({
  title,
  description,
}: {
  title: string;
  description: React.ReactNode;
}): JSX.Element => (
  <React.Fragment>
    <div className="trade-age-check-art">
      <span className="trade-age-check-art-card trade-age-check-art-card-shield">
        <span className="tilted-glyph-frame" />
        <Icon name="icon-regular-shield-check" className="tilted-glyph" size="XXLarge" />
      </span>
      <span className="trade-age-check-art-card trade-age-check-art-card-trade">
        <span className="tilted-glyph-frame" />
        <Icon
          name="icon-regular-hand-two-arrows-horizontal"
          className="tilted-glyph"
          size="XXLarge"
        />
      </span>
    </div>

    <div className="trade-age-check-copy">
      <h2 className="trade-age-check-title" aria-hidden>
        {title}
      </h2>
      {description}
    </div>
  </React.Fragment>
);

/**
 * Explains why an age check is needed before handing off to the shared facial
 * age estimation flow, which otherwise opens with no trades context at all.
 *
 * A bottom sheet on phones and a modal everywhere else, keyed off the same
 * user-agent check the rest of trades uses rather than a viewport query, so a
 * phone reporting a desktop-sized layout viewport still gets the sheet.
 */
export const TradeAgeCheckPrompt = ({
  isOpen,
  onOpenChange,
  onContinue,
}: TradeAgeCheckPromptProps): JSX.Element => {
  const { translate } = useTranslation();
  const isMobile = useMemo(() => detectMobile(), []);

  const title = translate("Title.LetsCheckYourAge");
  const description = (
    <p className="trade-age-check-description">
      {translate("Message.ThisMakesSendingAndReceiving")}
    </p>
  );
  const continueButton = (
    <Button variant="Emphasis" size="Medium" onClick={onContinue}>
      {translate("Action.Continue")}
    </Button>
  );

  if (!isMobile) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={onOpenChange}
        size="Medium"
        isModal
        hasCloseAffordance
        closeLabel={translate("Action.Close")}
      >
        {/* `size` only caps the content's max-width, so as in ConfirmDialog the
            content is filled out to actually reach it. */}
        <DialogContent style={{ width: "100%" }}>
          <DialogBody>
            <DialogTitle hidden>{title}</DialogTitle>
            <AgeCheckContent title={title} description={description} />
          </DialogBody>
          <DialogFooter className="trade-age-check-actions">{continueButton}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <SheetRoot open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        largeScreenVariant="center"
        className="trades-sheet trades-sheet-flush-actions"
        mobilePortraitClassName="trades-sheet-full-bleed"
        closeLabel={translate("Action.Close")}
      >
        <SheetTitle visuallyHideTitleText>{title}</SheetTitle>
        <SheetBody>
          <AgeCheckContent
            title={title}
            description={<SheetDescription>{description}</SheetDescription>}
          />
        </SheetBody>
        <SheetActions className="trade-age-check-actions">{continueButton}</SheetActions>
      </SheetContent>
    </SheetRoot>
  );
};

export default TradeAgeCheckPrompt;
