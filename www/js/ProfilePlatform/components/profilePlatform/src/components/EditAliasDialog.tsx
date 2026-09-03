import React from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogTitle,
  TextInput,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

type EditAliasDialogProps = {
  open: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  onAliasInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  aliasValue: string;
  hasErrored: boolean;
  textCount: number;
  maxCharacters: number;
  namePrompt: string;
};

const EditAliasDialog = ({
  open,
  onOpenChange,
  onClose,
  onSave,
  onAliasInputChange,
  aliasValue,
  hasErrored,
  textCount,
  maxCharacters,
  namePrompt,
}: EditAliasDialogProps) => {
  const { translate } = useTranslation();
  const vinculum = "/";

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="Medium"
      type="Default"
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
      isModal
      hasMarginTop
      hasMarginBottom
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle className="text-header-small padding-none">
            {translate("Label.CustomizeName")}
          </DialogTitle>
          <div className="text-label">
            <span
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: translate("Description.SetCustomName", { displayName: namePrompt }),
              }}
            />
          </div>
          <p className="text-body-small">{translate("Description.RecognizeFriendsByCustomName")}</p>
          <div className="flex flex-col gap-small">
            <div className="profile-transparent-input">
              <TextInput
                value={aliasValue}
                onChange={onAliasInputChange}
                placeholder={translate("Label.CustomName")}
                hasError={hasErrored}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption text-error">
                {hasErrored ? translate("Message.InvalidAliasError") : ""}
              </span>
              <span className="text-caption-body text-secondary">
                {textCount}
                {vinculum}
                {maxCharacters}
              </span>
            </div>
          </div>
          <div className="flex gap-medium justify-end">
            <Button variant="Standard" size="Medium" onClick={onClose}>
              {translate("Action.Cancel")}
            </Button>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <Button variant="Emphasis" size="Medium" onClick={onSave}>
              {translate("Action.Save")}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EditAliasDialog;
