import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, TextArea } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { TicketActionError } from "../../types";
import { getTicketActionRetryDelay, shouldRetryTicketAction } from "../../utils/ticketRetry";

interface TicketTextInputControlProps {
  placeholder?: string;
  minLength?: number;
  maxLength: number;
  submitText?: string;
  onSubmit: (message: string) => Promise<void>;
}

const TicketTextInputControl: React.FC<TicketTextInputControlProps> = ({
  placeholder,
  minLength,
  maxLength,
  submitText,
  onSubmit,
}) => {
  const { translate } = useTranslation();

  const [text, setText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const submitMutation = useMutation({
    mutationFn: onSubmit,
    retry: shouldRetryTicketAction,
    retryDelay: getTicketActionRetryDelay,
    onSuccess: () => {
      setText("");
    },
    onError: (error: Error) => {
      if (error instanceof TicketActionError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(translate("Response.UnexpectedError"));
      }
    },
  });

  const handleSubmit = () => {
    submitMutation.mutate(text);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      setText(e.target.value);
      setErrorMessage("");
    }
  };

  const hasError = errorMessage.length > 0;

  let helperText;
  if (hasError) {
    helperText = errorMessage;
  } else if (minLength && text.length < minLength) {
    helperText = translate("Message.ResponseCharactersRequired", { minLength });
  } else {
    helperText = translate("Message.CharactersRemaining", { count: maxLength - text.length });
  }

  return (
    <div>
      <TextArea
        textareaClassName="min-height-[96px]"
        size="Medium"
        placeholder={placeholder}
        maxLength={maxLength}
        helperText={helperText}
        textareaStyle={{ resize: "none" }}
        value={text}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isDisabled={submitMutation.isPending}
        hasError={hasError}
      />
      <Button
        className="margin-top-small"
        size="Medium"
        variant="Emphasis"
        onClick={handleSubmit}
        isDisabled={text.length < (minLength ?? 1) || submitMutation.isPending}
        isLoading={submitMutation.isPending}
      >
        {submitText ?? translate("Action.Submit")}
      </Button>
    </div>
  );
};

export default TicketTextInputControl;
