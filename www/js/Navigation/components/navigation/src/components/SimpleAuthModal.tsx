import React from "react";
// TODO: figure out a better way to do this
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { render } from "react-dom";
import { useTranslations } from "@rbx/www-common/i18n";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { navNamespaces } from "../constants/translationNamespaces";
import {
  MODAL_CONTAINER_ID,
  MODAL_TITLE_KEY,
  MODAL_BODY_CTA,
  MODAL_SIGN_IN_KEY,
} from "../constants/modalConstants";
import { navigateToLoginWithRedirect } from "../util/authUtil";
import {
  sendAuth401ModalButtonClickEvent,
  sendAuth401ModalShownEvent,
} from "../services/eventService";

interface SimpleAuthModalComponentProps {
  titleKey?: string;
  bodyContextKey?: string;
  bodyCtaKey?: string;
  buttonKey?: string;
}

export const SimpleAuthModal = ({
  titleKey,
  bodyContextKey,
  bodyCtaKey,
  buttonKey,
}: SimpleAuthModalComponentProps) => {
  const t = useTranslations("Authentication.LogoutModal");
  const [open, setOpen] = React.useState<boolean>(true);

  // fires once per mount, not again if props change
  React.useEffect(() => {
    sendAuth401ModalShownEvent();
  }, []);

  const handleClose = React.useCallback((): void => {
    sendAuth401ModalButtonClickEvent();
    setOpen(false);
    const container = document.getElementById(MODAL_CONTAINER_ID);
    container?.parentNode?.removeChild(container);
    navigateToLoginWithRedirect();
  }, []);

  const translate = (key: string) => (t.has(key) ? t(key) : "");
  const modalTitleText = translate(titleKey ?? MODAL_TITLE_KEY);
  const modalBodyContextText = bodyContextKey ? translate(bodyContextKey) : "";
  const modalBodyCtaText = translate(bodyCtaKey ?? MODAL_BODY_CTA);
  const modalButtonText = translate(buttonKey ?? MODAL_SIGN_IN_KEY);

  return (
    <Dialog open={open} size="Small" isModal hasCloseAffordance={false}>
      <DialogContent>
        <DialogBody className="gap-large">
          <DialogTitle className="text-heading-medium padding-none">{modalTitleText}</DialogTitle>
          {modalBodyContextText ? (
            <React.Fragment>
              <p className="text-body-medium">{modalBodyContextText}</p>
              <p className="text-body-medium">{modalBodyCtaText}</p>
            </React.Fragment>
          ) : (
            <p className="text-body-medium">{modalBodyCtaText}</p>
          )}
        </DialogBody>
        <DialogFooter className="width-full">
          <Button variant="Emphasis" className="width-full" onClick={handleClose} size="Medium">
            {modalButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface RenderSimpleAuthTranslationKeys {
  titleKey?: string;
  bodyContextKey?: string;
  bodyCtaKey?: string;
  buttonKey?: string;
}

export const renderSimpleAuth = (translationKeys: RenderSimpleAuthTranslationKeys = {}) => {
  const container = document.getElementById(MODAL_CONTAINER_ID);
  if (!container) return;

  render(
    <TranslationProviderSCC namespaces={navNamespaces}>
      <SimpleAuthModal {...translationKeys} />
    </TranslationProviderSCC>,
    container,
  );
};
