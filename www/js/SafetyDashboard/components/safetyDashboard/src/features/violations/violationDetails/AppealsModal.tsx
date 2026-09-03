import React, { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  TextArea,
  Button,
  Checkbox,
  TCheckboxCheckState,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { translateHtml } from "@rbx/translation-utils";
import CommunityStandardsLink from "../CommunityStandardsLink";

export const MAX_APPEAL_MESSAGE_LENGTH = 1000;

interface Props {
  onSubmit: (text?: string, optOutCommunication?: boolean) => unknown;
  onClose: () => unknown;
  enableOptOutCommunication: boolean;
  isLoading?: boolean;
}

/**
 * Modal with a text field to let the user submit an appeal
 */
const AppealsModal: React.FC<Props> = ({
  onSubmit,
  onClose,
  enableOptOutCommunication,
  isLoading,
}) => {
  const { translate } = useTranslation();

  const [text, setText] = useState("");
  const [optOutCommunication, setOptOutCommunication] = useState(false);

  const onInternalSubmit = () => {
    onSubmit(text, optOutCommunication);
  };

  const onOptOutCommunicationChange = (isChecked: TCheckboxCheckState) => {
    setOptOutCommunication(isChecked === true);
  };

  const formatAppealMessageCharCount = (length: number): string =>
    translate("Label.AppealMessageCharacterCount", {
      current: String(length),
      max: String(MAX_APPEAL_MESSAGE_LENGTH),
    });

  return (
    <Dialog
      open
      size="Medium"
      isModal
      hasMarginBottom
      hasMarginTop
      hasCloseAffordance={false}
      onOpenChange={onClose}
    >
      <DialogContent data-testid="appeals-modal" aria-describedby={undefined}>
        <DialogBody className="flex flex-col gap-xlarge">
          <div className="flex flex-col gap-xsmall">
            <DialogTitle className="text-heading-medium">
              {translate("Header.RequestAppeal")}
            </DialogTitle>
            <span className="text-body-large">
              {translateHtml(translate, "Description.RequestAppealReview.V3", [
                {
                  opening: "link",
                  closing: "linkEnd",
                  render: linkContent => (
                    <CommunityStandardsLink>{linkContent}</CommunityStandardsLink>
                  ),
                },
              ])}
            </span>
          </div>

          <div className="flex flex-col gap-xxsmall">
            <TextArea
              placeholder={translate("Label.RequestAppealPlaceholder")}
              value={text}
              maxLength={MAX_APPEAL_MESSAGE_LENGTH}
              onChange={e => {
                const { value } = e.target;
                setText(
                  value.length > MAX_APPEAL_MESSAGE_LENGTH
                    ? value.slice(0, MAX_APPEAL_MESSAGE_LENGTH)
                    : value,
                );
              }}
              textareaStyle={{
                resize: "vertical",
                minHeight: "60px",
                /**
                 * These are only needed because the global styles override both the Foundation UI styles and the
                 * Tailwind styles. Can be removed once the code is migrated to the /workspace directory.
                 */
                borderColor: "var(--color-stroke-emphasis)",
                backgroundColor: "transparent",
              }}
            />
            <span
              className="text-caption-small content-default self-end"
              data-testid="appeal-message-char-count"
              aria-live="polite"
            >
              {formatAppealMessageCharCount(text.length)}
            </span>
          </div>

          {enableOptOutCommunication && (
            <Checkbox
              label={translate("Label.EmailOptOutCheckbox")}
              isChecked={optOutCommunication}
              onCheckedChange={onOptOutCommunicationChange}
              placement="Start"
              size="Small"
            />
          )}
        </DialogBody>

        <DialogFooter className="flex flex-col gap-small">
          <div className="flex gap-x-small">
            <Button variant="Standard" size="Medium" onClick={onClose} className="fill">
              {translate("Action.Cancel")}
            </Button>
            <Button
              data-testid="appeals-success-modal-ok-button"
              variant="Emphasis"
              className="fill"
              size="Medium"
              onClick={onInternalSubmit}
              isDisabled={isLoading}
              isLoading={isLoading}
            >
              {translate("Action.Send")}
            </Button>
          </div>
          <span className="text-caption-small">{translate("Description.OneAppeal")}</span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppealsModal;
