import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  TextInput,
} from "@rbx/foundation-ui";
import { configurePrivateServerConstants } from "../../constants/configurePrivateServerConstants";

type ChangeNameDialogProps = {
  open: boolean;
  privateServerName: string;
  title: string;
  placeholder: string;
  changeActionText: string;
  cancelActionText: string;
  nameChangeErrorText: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (newName: string) => Promise<void>;
};

const ChangeNameDialog = ({
  open,
  privateServerName,
  title,
  placeholder,
  changeActionText,
  cancelActionText,
  nameChangeErrorText,
  onOpenChange,
  onSubmit,
}: ChangeNameDialogProps) => {
  const [nextName, setNextName] = useState(privateServerName);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (open) {
      setNextName(privateServerName);
      setErrorMessage("");
    }
  }, [open, privateServerName]);

  const { maxCharacters } = configurePrivateServerConstants.nameChange;
  const charCountLabel = `${nextName.length}/${maxCharacters}`;

  const isButtonDisabled = useMemo(
    () =>
      nextName.length < configurePrivateServerConstants.nameChange.minCharacters ||
      nextName.length > maxCharacters,
    [maxCharacters, nextName.length],
  );

  const handleSubmit = async () => {
    setErrorMessage("");
    try {
      await onSubmit(nextName);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : nameChangeErrorText);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="Medium"
      type="Default"
      hasCloseAffordance={false}
      isModal
    >
      <DialogContent className="!min-width-[280px] width-full">
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle className="text-heading-small">{title}</DialogTitle>
          <TextInput
            value={nextName}
            onChange={event => {
              setNextName(event.target.value);
              setErrorMessage("");
            }}
            maxLength={maxCharacters}
            placeholder={placeholder}
            hasError={Boolean(errorMessage)}
          />
          <div className="flex justify-between items-center">
            <span className="text-caption-body content-default" aria-label="character count">
              {charCountLabel}
            </span>
            {errorMessage && (
              <span aria-live="assertive" className="text-caption-body content-system-alert">
                {errorMessage}
              </span>
            )}
          </div>
        </DialogBody>
        <DialogFooter className="flex flex-col gap-small small:flex-row">
          <Button
            variant="Emphasis"
            size="Medium"
            className="fill small:basis-0"
            isDisabled={isButtonDisabled}
            onClick={() => {
              handleSubmit();
            }}
          >
            {changeActionText}
          </Button>
          <Button
            variant="Standard"
            size="Medium"
            className="fill small:basis-0"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {cancelActionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeNameDialog;
