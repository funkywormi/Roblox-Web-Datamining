import React, { useCallback, useMemo, useState } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogFooter,
  Button,
  Checkbox,
  TextArea,
} from "@rbx/foundation-ui";
import {
  FeatureGameDetails,
  CommonUIControls,
  CommonUIFeatures,
} from "../constants/translationConstants";
import { NotInterestedFeedbackFormActionType } from "../constants/eventStreamConstants";

enum NotInterestedFeedbackFormCheckboxItems {
  TooRepetitive = "TooRepetitive",
  DontLikeGame = "DontLikeGame",
  DontLikeImage = "DontLikeImage",
  InappropriateContent = "InappropriateContent",
  SomethingElse = "SomethingElse",
}

type TNotInterestedFeedbackFormCheckboxItem = {
  value: NotInterestedFeedbackFormCheckboxItems;
  label: string;
};

type TNotInterestedFeedbackFormProps = {
  open: boolean;
  onClose: (isCloseFromSubmit?: boolean) => void;
  sendActionEvent: (actionType: NotInterestedFeedbackFormActionType) => void;
  sendSignal: (selectedValues: { [key: string]: boolean }, text: string) => void;
  setShowGiveFeedbackButton: (show: boolean) => void;
  translate: TranslateFunction;
};

const NotInterestedFeedbackForm = ({
  open,
  onClose,
  sendActionEvent,
  sendSignal,
  setShowGiveFeedbackButton,
  translate,
}: TNotInterestedFeedbackFormProps): JSX.Element => {
  const [text, setText] = useState<string>("");
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let updatedText = e.target.value;
    if (updatedText.length > 500) {
      updatedText = updatedText.substring(0, 500);
    }
    setText(updatedText);
  };

  const [selectedValues, setSelectedValues] = React.useState<
    Record<NotInterestedFeedbackFormCheckboxItems, boolean>
  >({
    [NotInterestedFeedbackFormCheckboxItems.TooRepetitive]: false,
    [NotInterestedFeedbackFormCheckboxItems.DontLikeGame]: false,
    [NotInterestedFeedbackFormCheckboxItems.DontLikeImage]: false,
    [NotInterestedFeedbackFormCheckboxItems.InappropriateContent]: false,
    [NotInterestedFeedbackFormCheckboxItems.SomethingElse]: false,
  });
  const toggleCheckbox = (value: NotInterestedFeedbackFormCheckboxItems) => {
    setSelectedValues(prev => ({
      ...prev,
      [value]: !prev[value],
    }));
  };

  const checkboxItems: TNotInterestedFeedbackFormCheckboxItem[] = useMemo(() => {
    return [
      {
        value: NotInterestedFeedbackFormCheckboxItems.TooRepetitive,
        label: translate(FeatureGameDetails.LabelTooRepetitive),
      },
      {
        value: NotInterestedFeedbackFormCheckboxItems.DontLikeGame,
        label: translate(FeatureGameDetails.LabelDontLikeGame),
      },
      {
        value: NotInterestedFeedbackFormCheckboxItems.DontLikeImage,
        label: translate(FeatureGameDetails.LabelDontLikeImage),
      },
      {
        value: NotInterestedFeedbackFormCheckboxItems.InappropriateContent,
        label: translate(FeatureGameDetails.LabelInappropriateContent),
      },
      {
        value: NotInterestedFeedbackFormCheckboxItems.SomethingElse,
        label: translate(FeatureGameDetails.LabelSomethingElse),
      },
    ];
  }, [translate]);

  const handleClose = useCallback(
    (isCloseFromSubmit?: boolean) => {
      setSelectedValues({
        [NotInterestedFeedbackFormCheckboxItems.TooRepetitive]: false,
        [NotInterestedFeedbackFormCheckboxItems.DontLikeGame]: false,
        [NotInterestedFeedbackFormCheckboxItems.DontLikeImage]: false,
        [NotInterestedFeedbackFormCheckboxItems.InappropriateContent]: false,
        [NotInterestedFeedbackFormCheckboxItems.SomethingElse]: false,
      });
      setText("");
      onClose(isCloseFromSubmit);
    },
    [onClose],
  );

  const showTextArea = selectedValues[NotInterestedFeedbackFormCheckboxItems.SomethingElse];

  const isSubmitEnabled = useMemo(() => {
    if (!Object.values(selectedValues).some(value => value === true)) {
      return false;
    }

    if (showTextArea) {
      return text.length >= 10;
    }

    return true;
  }, [selectedValues, text, showTextArea]);
  const onSubmitFeedback = useCallback(() => {
    setShowGiveFeedbackButton(false);
    sendSignal(selectedValues, text);
    sendActionEvent(NotInterestedFeedbackFormActionType.NotInterestedFeedbackFormSubmitted);
    handleClose(true);
  }, [selectedValues, text, handleClose, sendSignal, setShowGiveFeedbackButton, sendActionEvent]);

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      size="Medium"
      isModal
      hasMarginBottom
      hasMarginTop
      hasCloseAffordance
      closeLabel={translate(CommonUIFeatures.ActionClose)}
    >
      <DialogContent>
        <DialogBody>
          <div className="flex flex-col gap-large">
            <DialogTitle className="text-heading-small">
              {translate(FeatureGameDetails.LabelProvideFeedbackTitle)}
            </DialogTitle>
            <div className="text-body-medium">
              <span>{translate(FeatureGameDetails.MessageHelpImproveExperience)}</span>
            </div>
            <div className="flex flex-col gap-small">
              <div className="text-title-large">
                {translate(FeatureGameDetails.MessageHidingExperienceQuestion)}
              </div>
              {checkboxItems.map(checkboxItemData => (
                <Checkbox
                  key={checkboxItemData.value}
                  label={checkboxItemData.label}
                  size="Medium"
                  placement="Start"
                  isChecked={selectedValues[checkboxItemData.value] ?? false}
                  onCheckedChange={() => toggleCheckbox(checkboxItemData.value)}
                />
              ))}
            </div>
            {showTextArea && (
              <TextArea
                placeholder={translate(FeatureGameDetails.LabelTellUsMorePlaceholder)}
                size="Medium"
                value={text}
                onChange={handleTextChange}
                textareaStyle={{ resize: "vertical" }}
              />
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            className="width-full"
            variant="Standard"
            size="Medium"
            isDisabled={!isSubmitEnabled}
            onClick={onSubmitFeedback}
          >
            {translate(CommonUIControls.ActionSubmit)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotInterestedFeedbackForm;
