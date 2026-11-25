import type { ReactNode } from "react";

import { ModalQuestionType, type ModalAnswer, type ModalQuestion } from "../../types";
import { SingleChoiceQuestion } from "./SingleChoiceQuestion";
import { TextQuestion } from "./TextQuestion";

export type QuestionRendererProps = {
  question: ModalQuestion;
  answer: ModalAnswer;
  onAnswerChanged: (answer: ModalAnswer) => void;
  isDisabled: boolean;
};

export const renderQuestion = (props: QuestionRendererProps): ReactNode => {
  switch (props.question.type) {
    case ModalQuestionType.MultipleChoiceSingle:
      return <SingleChoiceQuestion {...props} />;
    case ModalQuestionType.Text:
      return <TextQuestion {...props} />;
    default:
      console.error("Unsupported modal survey question type:", props.question.type);
      return null;
  }
};
