import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateRandomUuid } from "@rbx/core-lib/uuid";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";

import { submitModalSurveyResponse } from "../services/modalSurveyService";
import { modalSurveyTranslationKeys } from "../translationKeys";
import {
  ModalQuestionType,
  type ModalAnswer,
  type ModalQuestion,
  type ModalSurvey,
  type ModalSurveyAnswer,
} from "../types";
import { renderQuestion } from "./questions/renderQuestion";

type SurveyModalProps = {
  survey: ModalSurvey;
  open: boolean;
  onClose: () => void;
};

enum Phase {
  Answering = "answering",
  SubmitError = "submitError",
  Completed = "completed",
}

const toResponse = (question: ModalQuestion, answer: ModalAnswer = {}): ModalAnswer | null => {
  if (question.type === ModalQuestionType.Text) {
    const text = answer.text?.trim();
    return text ? { text } : null;
  }
  return answer.choiceIds?.length ? { choiceIds: answer.choiceIds } : null;
};

const buildSubmitAnswers = (
  questions: ModalQuestion[],
  answersByQuestionId: Record<string, ModalAnswer>,
): ModalSurveyAnswer[] =>
  questions.flatMap(question => {
    const response = toResponse(question, answersByQuestionId[question.questionId]);
    return response ? [{ questionId: question.questionId, type: question.type, response }] : [];
  });

/**
 * The "Give us feedback" modal for a SurvBlox modal survey. It shows one question at a time,
 * submits every answer in a single request at the end, and confirms once the answers are
 * recorded. Dismissing it before then submits whatever was answered. The host fetches the survey,
 * owns the open state, and provides a `QueryClientProvider` ancestor.
 */
export const SurveyModal = ({ survey, open, onClose }: SurveyModalProps) => {
  const t = useTranslations("Feature.QualtricsSurveyPrompt");
  const [idempotencyKey] = useState(generateRandomUuid);
  const [index, setIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, ModalAnswer>>({});
  const [phase, setPhase] = useState(Phase.Answering);
  const { mutate: submitResponse, isPending: isSubmitting } = useMutation({
    mutationFn: submitModalSurveyResponse,
  });

  const question = survey.questions[index];
  if (!question) {
    return null;
  }
  const isLastQuestion = index === survey.questions.length - 1;
  const canContinue =
    !question.required || toResponse(question, answersByQuestionId[question.questionId]) !== null;

  const buildRequest = () => ({
    surveyId: survey.surveyId,
    idempotencyKey,
    answers: buildSubmitAnswers(survey.questions, answersByQuestionId),
  });

  const dismiss = () => {
    if (phase !== Phase.Completed) {
      // Best-effort fire and forget.
      submitResponse(buildRequest());
    }
    onClose();
  };

  const submit = () => {
    submitResponse(buildRequest(), {
      onSuccess: () => {
        setPhase(Phase.Completed);
      },
      onError: () => {
        setPhase(Phase.SubmitError);
      },
    });
  };

  const getPrimaryAction = () => {
    if (phase === Phase.Completed) {
      return {
        label: t(modalSurveyTranslationKeys.done),
        variant: "Emphasis",
        onClick: onClose,
      } as const;
    }
    if (phase === Phase.SubmitError) {
      return {
        label: t(modalSurveyTranslationKeys.retry),
        variant: "Standard",
        onClick: submit,
      } as const;
    }
    if (isLastQuestion) {
      return {
        label: t(modalSurveyTranslationKeys.send),
        variant: "Emphasis",
        onClick: submit,
      } as const;
    }
    return {
      label: t(modalSurveyTranslationKeys.next),
      variant: "Emphasis",
      onClick: () => {
        setIndex(index + 1);
      },
    } as const;
  };
  const primaryAction = getPrimaryAction();

  return (
    <Dialog
      closeLabel={t(modalSurveyTranslationKeys.close)}
      hasCloseAffordance
      isModal
      open={open}
      size="Medium"
      type="Default"
      onOpenChange={openDialog => {
        if (!openDialog && !isSubmitting) {
          dismiss();
        }
      }}
    >
      <DialogContent>
        <DialogBody className="gap-large flex flex-col">
          <DialogTitle className="text-heading-small content-emphasis [padding-inline-end:var(--size-800)]">
            {phase === Phase.Completed
              ? t(modalSurveyTranslationKeys.completedTitle)
              : t(modalSurveyTranslationKeys.title)}
          </DialogTitle>
          {phase === Phase.Answering &&
            renderQuestion({
              question,
              answer: answersByQuestionId[question.questionId] ?? {},
              onAnswerChanged: answer => {
                setAnswersByQuestionId(prev => ({ ...prev, [question.questionId]: answer }));
              },
              isDisabled: isSubmitting,
            })}
          {phase === Phase.SubmitError && (
            <span className="text-body-medium content-default" role="alert">
              {t(modalSurveyTranslationKeys.error)}
            </span>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            className="width-full"
            isDisabled={phase === Phase.Answering && !canContinue}
            isLoading={isSubmitting}
            size="Medium"
            variant={primaryAction.variant}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
