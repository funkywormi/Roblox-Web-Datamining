import React from "react";
import { DialogTitle, Divider, Icon } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";

export type VerificationDialogHeaderProps = {
  titleText: string;
  onClose: () => void;
  className?: string;
  closeClassName?: string;
  titleClassName?: string;
};

const VerificationDialogHeader = ({
  titleText,
  onClose,
  className = "",
  closeClassName = "",
  titleClassName = "text-title-large medium:text-heading-small",
}: VerificationDialogHeaderProps): React.JSX.Element => {
  const translate = useTranslations("CommonUI.Controls");
  return (
    <React.Fragment>
      <div
        className={`${className} grid [grid-template-columns:minmax(var(--size-600),1fr)_minmax(0,auto)_minmax(var(--size-600),1fr)] items-center gap-small padding-x-large padding-y-small`}
      >
        <button
          type="button"
          className={`${closeClassName} justify-self-start flex bg-none stroke-none padding-none`}
          aria-label={translate("Action.Close")}
          onClick={onClose}
        >
          <Icon name="icon-regular-x" size="Large" />
        </button>
        <DialogTitle className={`${titleClassName} text-align-x-center`}>{titleText}</DialogTitle>
        <div />
      </div>
      <Divider />
    </React.Fragment>
  );
};

export default VerificationDialogHeader;
