import type { InlinePromptStyle } from "../common/constants/promptStyleConstants";
import type { InlinePromptEntryPoint } from "../common/constants/promptEntryPointConstants";
import { CardContainerPrompt } from "./components/card-container/CardContainerPrompt";
import { InlineBannerPrompt } from "./components/inline-banner/InlineBannerPrompt";
import type { ClientAttributes } from "../common/types/promptTypes";
import { ErrorBoundary } from "../common/components/ErrorBoundary";

export type InlinePromptProps = {
  entryPoint: InlinePromptEntryPoint;
  promptStyle: InlinePromptStyle;
  clientAttributes?: ClientAttributes;
};

const BaseInlinePrompt = ({ entryPoint, promptStyle, clientAttributes }: InlinePromptProps) => {
  switch (promptStyle) {
    case "CardContainer": {
      return <CardContainerPrompt entryPoint={entryPoint} clientAttributes={clientAttributes} />;
    }
    case "InlineBanner": {
      return <InlineBannerPrompt entryPoint={entryPoint} clientAttributes={clientAttributes} />;
    }
    default: {
      return null;
    }
  }
};

export const InlinePrompt = (props: InlinePromptProps) => {
  return (
    <ErrorBoundary entryPoint={props.entryPoint} componentType="InlinePrompt">
      <BaseInlinePrompt {...props} />
    </ErrorBoundary>
  );
};
