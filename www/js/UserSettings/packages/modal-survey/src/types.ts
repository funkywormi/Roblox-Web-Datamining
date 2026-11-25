import * as z from "zod/mini";

/**
 * Client contract for SurvBlox surveys served with `surveyType=inline`. Mirrors
 * `GetSurveyResponse` and `SubmitSurveyResponseRequest` in Roblox/survblox
 * `internal/controller/http_controller`, and the question and answer types in
 * `internal/types/inline_survey.go`.
 */

export enum ModalQuestionType {
  MultipleChoiceSingle = "MC_SINGLE",
  Text = "TEXT",
}

export const modalQuestionTypeSchema = z.enum(ModalQuestionType);

const modalChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  requiresText: z.boolean(),
});
export type ModalChoice = z.infer<typeof modalChoiceSchema>;

const modalQuestionSchema = z.object({
  questionId: z.string(),
  type: modalQuestionTypeSchema,
  title: z.string(),
  choices: z.optional(z.array(modalChoiceSchema)),
  required: z.boolean(),
});
export type ModalQuestion = z.infer<typeof modalQuestionSchema>;

/** `surveyId` and `questions` are omitted when `shouldPromptSurvey` is false. */
export const getModalSurveyResponseSchema = z.object({
  surveyId: z.optional(z.string()),
  shouldPromptSurvey: z.boolean(),
  questions: z.optional(z.array(modalQuestionSchema)),
});

/** An eligible survey, narrowed from the fetch response once `shouldPromptSurvey` is true. */
export type ModalSurvey = {
  surveyId: string;
  questions: ModalQuestion[];
};

/** The answer to one question: `text` for TEXT, `choiceIds` for multiple choice. */
export type ModalAnswer = {
  text?: string;
  choiceIds?: string[];
};

export type ModalSurveyAnswer = {
  questionId: string;
  type: ModalQuestionType;
  response: ModalAnswer;
};

export type SubmitModalSurveyRequest = {
  surveyId: string;
  idempotencyKey: string;
  answers: ModalSurveyAnswer[];
};

export const submitModalSurveyResponseSchema = z.object({
  responseId: z.string(),
});
export type SubmitModalSurveyResponse = z.infer<typeof submitModalSurveyResponseSchema>;
