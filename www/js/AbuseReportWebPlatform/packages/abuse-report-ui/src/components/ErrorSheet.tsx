import React, { useMemo } from "react";
import {
  SheetRoot,
  SheetContent,
  SheetTitle,
  SheetBody,
  SheetDescription,
} from "@rbx/foundation-ui";
import { TranslationResourceProvider, Intl } from "@rbx/core-scripts/legacy/Roblox";

export interface ErrorSheetProps {
  open: boolean;
  onClose: () => void;
  onCloseAutoFocus?: () => void;
}

/**
 * Error sheet component that displays a hardcoded error message.
 * Used when the abuse report dialog fails to load its configuration.
 */
const ErrorSheet = ({ open, onClose, onCloseAutoFocus }: ErrorSheetProps): React.ReactElement => {
  const { message, title, closeLabel } = useMemo(() => {
    // I am unsure about how to best accomplish this.
    // The whole abuse-report-ui package is meant to be integrated into other apps/components,
    // so it has no associated translations.
    // In normal usage, all the translations used will come through the abuse-report API.
    // But in the case that API fails, we'd still want to show a fallback error message.
    // For now, we'll assume we're on web and the common UI translations are available.
    const intl = new Intl();
    const translationProvider = new TranslationResourceProvider(intl);
    const resources = ["CommonUI.Messages", "CommonUI.Controls"];
    const languageResources = translationProvider.mergeTranslationResources(
      ...resources.map(resource => translationProvider.getTranslationResource(resource)),
    );

    return {
      message: languageResources.get("Response.UnexpectedError"),
      title: languageResources.get("Label.Error"),
      closeLabel: languageResources.get("Action.Close"),
    };
  }, []);

  return (
    <SheetRoot
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <SheetContent
        centerSheetSize="Medium"
        closeLabel={closeLabel}
        largeScreenVariant="center"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <SheetTitle>{title}</SheetTitle>
        <SheetBody>
          <SheetDescription>
            <div className="text-body-medium padding-bottom-large">{message}</div>
          </SheetDescription>
        </SheetBody>
      </SheetContent>
    </SheetRoot>
  );
};

export default ErrorSheet;
