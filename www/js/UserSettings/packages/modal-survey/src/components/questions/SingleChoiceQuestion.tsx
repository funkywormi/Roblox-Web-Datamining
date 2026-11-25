import { Radio, RadioGroup } from "@rbx/foundation-ui";

import type { QuestionRendererProps } from "./renderQuestion";

export const SingleChoiceQuestion = ({
  question,
  answer,
  onAnswerChanged,
  isDisabled,
}: QuestionRendererProps) => {
  const selectedChoiceId = answer.choiceIds?.[0];

  return (
    <RadioGroup
      className="gap-medium flex flex-col"
      groupLabel={question.title}
      isDisabled={isDisabled}
      value={selectedChoiceId ?? ""}
      onValueChange={choiceId => {
        onAnswerChanged({ choiceIds: [choiceId] });
      }}
    >
      {(question.choices ?? []).map(choice => (
        <Radio key={choice.id} label={choice.label} value={choice.id} />
      ))}
    </RadioGroup>
  );
};
