import React, { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogTitle,
  Button,
  TextArea,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import { UrlConfig } from "@rbx/core-scripts/http";

const MAX_BIO_LENGTH = 1000;
const CHARACTER_COUNT_SEPARATOR = "/";

const DESCRIPTION_URL = `${environmentUrls.usersApi}/v1/description`;

type ChangeBioModalProps = {
  open: boolean;
  onClose: () => void;
  onBioUpdated?: () => void;
  initialBio?: string;
};

const ChangeBioModal: React.FC<ChangeBioModalProps> = ({
  open,
  onClose,
  onBioUpdated,
  initialBio = "",
}) => {
  const { translate } = useTranslation();
  const [bio, setBio] = useState(initialBio);
  const [attemptedOverflow, setAttemptedOverflow] = useState(false);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose();
      }
    },
    [onClose],
  );

  const mutation = useMutation({
    mutationFn: async (description: string) => {
      const formData = new URLSearchParams();
      formData.append("description", description);

      const urlConfig: UrlConfig = {
        url: DESCRIPTION_URL,
        withCredentials: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };

      await http.post(urlConfig, formData);
    },
    onSuccess: () => {
      onBioUpdated?.();
      onClose();
    },
  });

  const handleBioChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      if (value.length > MAX_BIO_LENGTH) {
        setBio(value.slice(0, MAX_BIO_LENGTH));
        setAttemptedOverflow(true);
      } else {
        setBio(value);
        setAttemptedOverflow(false);
      }
      mutation.reset();
    },
    [mutation],
  );

  const handleSaveClick = useCallback(() => {
    mutation.mutate(bio);
  }, [bio, mutation]);

  const characterCount = bio.length;

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      isModal
      size="Medium"
      type="Default"
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
    >
      <DialogContent>
        <DialogBody className="gap-large flex flex-col">
          <div>
            <DialogTitle className="text-heading-small">{translate("Label.Title")}</DialogTitle>
            <p>{translate("Label.Description")}</p>
          </div>

          <div className="scroll-y">
            <TextArea
              placeholder={translate("Label.Placeholder")}
              value={bio}
              onChange={handleBioChange}
              rows={6}
              hasError={mutation.isError || attemptedOverflow}
              helperText={mutation.isError ? translate("Label.GenericFailure") : undefined}
              size="Medium"
            />
            <div className="flex items-center justify-end padding-top-small">
              <span
                className={
                  attemptedOverflow
                    ? "text-caption-medium content-system-alert"
                    : "text-caption-medium"
                }
              >
                {characterCount}
                {CHARACTER_COUNT_SEPARATOR}
                {MAX_BIO_LENGTH}
              </span>
            </div>
          </div>

          <div>
            <Button
              variant="Emphasis"
              size="Medium"
              onClick={handleSaveClick}
              isDisabled={mutation.isPending || mutation.isSuccess}
              className="min-width-[104px]"
            >
              {translate("Action.Save")}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeBioModal;
