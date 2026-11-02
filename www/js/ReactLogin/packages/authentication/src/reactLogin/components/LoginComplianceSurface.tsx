import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import type { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { CountryRatingLogos } from "@rbx/content-rating-logos";
import { landingPageStrings, urlConstants } from "../../reactLanding/constants/landingConstants";

export type LoginComplianceSurfaceProps = {
  shouldDisplayBrazilRatingLogo: boolean;
  shouldDisplayItalyRatingLogo: boolean;
  translate: WithTranslationsProps["translate"];
};

const LoginComplianceSurface = ({
  shouldDisplayBrazilRatingLogo,
  shouldDisplayItalyRatingLogo,
  translate,
}: LoginComplianceSurfaceProps): React.JSX.Element => {
  const [isItalyRatingModalOpen, setIsItalyRatingModalOpen] = useState(false);

  const openItalyContentRatingGuide = (): void => {
    window.open(urlConstants.italyContentRatingGuide, "_blank");
    setIsItalyRatingModalOpen(false);
  };

  return (
    <div>
      <CountryRatingLogos
        shouldDisplayBrazilRatingLogo={shouldDisplayBrazilRatingLogo}
        shouldDisplayItalyRatingLogo={shouldDisplayItalyRatingLogo}
        onItalyContentRatingLogoClick={
          shouldDisplayItalyRatingLogo ? () => setIsItalyRatingModalOpen(true) : undefined
        }
      />
      {shouldDisplayItalyRatingLogo && (
        <Dialog
          open={isItalyRatingModalOpen}
          isModal
          size="Small"
          type="Default"
          hasCloseAffordance={false}
          onOpenChange={setIsItalyRatingModalOpen}
        >
          <DialogContent>
            <DialogBody className="flex flex-col gap-xsmall">
              <DialogTitle className="text-heading-small content-emphasis">
                {translate(landingPageStrings.leavingRoblox)}
              </DialogTitle>
              <p className="text-body-medium content-default">
                {translate(landingPageStrings.externalWebsiteRedirect)}
              </p>
            </DialogBody>
            <DialogFooter className="flex gap-small padding-top-medium">
              <Button
                variant="ActionUtility"
                size="Medium"
                onClick={() => setIsItalyRatingModalOpen(false)}
              >
                {translate(landingPageStrings.cancel)}
              </Button>
              <Button variant="Emphasis" size="Medium" onClick={openItalyContentRatingGuide}>
                {translate(landingPageStrings.continue)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LoginComplianceSurface;
