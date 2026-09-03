import { createCsrErrorReporter } from "@rbx/sdui-client";
import { bindPromptErrorReporter } from "./promptErrorPayload";
import { PROMPTS_APPLICATION_NAME } from "./constants";

const createPromptsErrorReporter = () => {
  const reporter = createCsrErrorReporter({
    applicationName: PROMPTS_APPLICATION_NAME,
  });

  return {
    reportPromptError: bindPromptErrorReporter(reporter),
  };
};

export type PromptsErrorReporter = ReturnType<typeof createPromptsErrorReporter>;

let cachedReporter: PromptsErrorReporter | undefined;

export const getPromptsErrorReporter = (): PromptsErrorReporter => {
  cachedReporter ??= createPromptsErrorReporter();
  return cachedReporter;
};
