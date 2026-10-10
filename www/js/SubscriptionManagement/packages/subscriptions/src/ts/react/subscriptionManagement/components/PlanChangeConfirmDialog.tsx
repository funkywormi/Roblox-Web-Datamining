import React from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Link,
} from "@rbx/foundation-ui";
import { SUBSCRIPTION_TERMS_URL, type TranslateFn, translateHtml } from "@rbx/subscriptions-common";
import { useTranslations } from "@rbx/www-common/i18n";

type PlanChangeConfirmDialogProps = {
  open: boolean;
  description: string;
  isConfirming: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};

const PlanChangeConfirmDialog: React.FC<PlanChangeConfirmDialogProps> = ({
  open,
  description,
  isConfirming,
  onConfirm,
  onOpenChange,
}) => {
  const t = useTranslations("Feature.RobloxSubscription");
  // `t` only accepts this namespace's keys, so `translateHtml` gets a string-keyed one bound to the
  // legal copy.
  const translateLegal: TranslateFn = (_key, params) => t("Description.PlanChangeLegal", params);

  return (
    <Dialog
      closeLabel={t("Action.Close")}
      hasCloseAffordance
      isModal
      open={open}
      size="Small"
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogBody className="gap-small flex flex-col">
          <DialogTitle className="text-heading-small content-emphasis">
            {t("Header.PlanChangeDialogTitle")}
          </DialogTitle>
          <p className="text-body-medium content-default">{description}</p>
        </DialogBody>
        <DialogFooter className="gap-medium flex flex-col">
          <Button
            className="width-full"
            isLoading={isConfirming}
            size="Medium"
            variant="Emphasis"
            onClick={onConfirm}
          >
            {t("Action.Confirm")}
          </Button>
          <p className="text-body-small content-default">
            {translateHtml(translateLegal, "Description.PlanChangeLegal", [
              {
                opening: "linkStart",
                closing: "linkEnd",
                render: children => (
                  <Link
                    href={SUBSCRIPTION_TERMS_URL}
                    rel="noopener noreferrer"
                    size="Small"
                    target="_blank"
                    underline="always"
                    variant="Inline"
                  >
                    {children}
                  </Link>
                ),
              },
            ])}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanChangeConfirmDialog;
