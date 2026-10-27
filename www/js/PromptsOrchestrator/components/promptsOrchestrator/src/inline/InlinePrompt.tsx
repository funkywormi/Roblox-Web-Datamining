import { appDownloadNamespaces } from "@rbx/app-download";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
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

/**
 * Host bundles (the home page) render this through the `@rbx/prompts-orchestrator` external, so it
 * runs outside this entry's tree and any host provider, which belongs to another `use-intl` copy.
 * It provides the namespaces its SDUI content needs itself, like the entry does.
 */
export const InlinePrompt = (props: InlinePromptProps) => {
  return (
    <ErrorBoundary entryPoint={props.entryPoint} componentType="InlinePrompt">
      <TranslationProviderSCC namespaces={appDownloadNamespaces}>
        <BaseInlinePrompt {...props} />
      </TranslationProviderSCC>
    </ErrorBoundary>
  );
};
