import { TextArea } from "@rbx/foundation-ui";

import type { QuestionRendererProps } from "./renderQuestion";

export const TextQuestion = ({
  question,
  answer,
  onAnswerChanged,
  isDisabled,
}: QuestionRendererProps) => (
  <TextArea
    isDisabled={isDisabled}
    label={question.title}
    rows={6}
    textareaStyle={{ resize: "none" }}
    value={answer.text ?? ""}
    onChange={event => {
      onAnswerChanged({ text: event.target.value });
    }}
  />
);
