import React from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { FeatureLoginPage } from "@rbx/authentication-common/constants/translationConstants";
import { isParentalRequestsMagicLink } from "./magicLinkLoginUtils";

type MagicLinkLoginErrorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  translate: TranslateFunction;
};

const MagicLinkLoginErrorModal = ({
  isOpen,
  onClose,
  translate,
}: MagicLinkLoginErrorModalProps): JSX.Element => {
  const descriptionResourceId = isParentalRequestsMagicLink()
    ? FeatureLoginPage.DescriptionLinkExpiredSignInSettings
    : FeatureLoginPage.DescriptionLinkExpired;

  return (
    <Dialog open={isOpen} isModal size="Small" type="Default" hasCloseAffordance={false}>
      <DialogContent>
        <DialogBody className="flex flex-col gap-xsmall">
          <DialogTitle className="text-heading-small content-emphasis">
            {translate(FeatureLoginPage.HeaderThisLinkExpired)}
          </DialogTitle>
          <p className="text-body-medium content-default">{translate(descriptionResourceId)}</p>
        </DialogBody>
        <DialogFooter className="flex flex-col padding-top-medium">
          <Button variant="Emphasis" size="Medium" onClick={onClose}>
            {translate(FeatureLoginPage.ActionOk)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MagicLinkLoginErrorModal;
