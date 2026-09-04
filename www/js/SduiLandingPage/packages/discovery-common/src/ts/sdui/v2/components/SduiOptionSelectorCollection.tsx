"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import {
  SduiErrorName,
  SduiPlaceholderWrapper,
  componentTypeName,
  expandManagedList,
  omitPropSignals,
  type SduiComponentConfig,
  type SduiManagedChildList,
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
} from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";
import { SduiVariableItemWidthCarousel } from "./SduiVariableItemWidthCarousel";

const DEFAULT_OPTION_IMPRESSION_EVENT_NAME = "optionSelectorImpressions";

/** Selection props this component injects into every option item. */
const PARENT_OWNED_OPTION_PROPS = ["isChecked", "isDisabled", "onActivated"] as const;

type OptionData = {
  id?: string;
};

export type SduiOptionSelectorCollectionProps = SduiRendererInjectedProps & {
  title?: string;
  subtitle?: string;
  selectedOption?: string;
  /** Refresh action; set `action_event_name` on the Action for click telemetry. */
  onOptionActivated?: SduiResolvedAction;
  paddingBetweenOptionSelectorAndCollection?: number;
  collectionComponent?: React.ReactNode | SduiManagedChildList;
  placeholderCollectionComponent?: React.ReactNode | SduiManagedChildList;
  placeholderTransitionDurationSeconds?: number;
  optionItemConfigs?: SduiManagedChildList;
  optionsData?: OptionData[];
  itemPadding?: number;
  scrollButtonsEnabled?: boolean;
  optionImpressionEventName?: string;
  skipOptionItemImpressionsLog?: boolean;
};

/**
 * Renders a selectable option row above a collection, mirroring lua
 * `SduiOptionSelectorCollection` with optimistic selection and placeholder swap.
 */
export function SduiOptionSelectorCollection({
  title,
  subtitle,
  selectedOption,
  onOptionActivated,
  paddingBetweenOptionSelectorAndCollection,
  collectionComponent,
  placeholderCollectionComponent,
  placeholderTransitionDurationSeconds,
  optionItemConfigs,
  optionsData = [],
  itemPadding,
  scrollButtonsEnabled,
  optionImpressionEventName = DEFAULT_OPTION_IMPRESSION_EVENT_NAME,
  skipOptionItemImpressionsLog = true,
  analyticsContext,
  componentType,
}: SduiOptionSelectorCollectionProps): React.JSX.Element {
  const services = useSduiServices();
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  const pendingOptionRef = useRef<string | null>(null);
  const latestRefreshIdRef = useRef(0);

  // Avoids re-creating onOptionActivatedHandler on every pendingOption change.
  pendingOptionRef.current = pendingOption;

  const effectiveSelectedOption = pendingOption ?? selectedOption;

  useEffect(() => {
    setPendingOption(null);
  }, [selectedOption]);

  const onOptionActivatedHandler = useCallback(
    (optionId: unknown): Promise<void> => {
      if (typeof optionId !== "string" || optionId === "") {
        services.errorReporter.reportSduiError(
          SduiErrorName.MalformedActionParam,
          `Invalid or missing option id: ${String(optionId)}`,
          services.pageContext,
          { propName: "optionId", name: "OptionSelectorCollection" },
        );
        return Promise.resolve();
      }

      const effectiveOption = pendingOptionRef.current ?? selectedOption;
      if (effectiveOption === optionId) {
        return Promise.resolve();
      }

      if (!onOptionActivated) {
        return Promise.resolve();
      }

      setPendingOption(optionId);

      latestRefreshIdRef.current += 1;
      const refreshId = latestRefreshIdRef.current;

      return onOptionActivated
        .onActivatedAsync({
          selectedOptionIds: [optionId],
          // passing selectedOption separately for analytics because the message
          // schema is keyed to selectedOption
          selectedOption: optionId,
        })
        .finally(() => {
          if (latestRefreshIdRef.current === refreshId) {
            setPendingOption(null);
          }
        })
        .catch(() => undefined);
    },
    [onOptionActivated, selectedOption, services.errorReporter, services.pageContext],
  );

  const optionSelectorItems: SduiManagedChildList | undefined = useMemo(() => {
    if (!optionItemConfigs) {
      return undefined;
    }

    const configs = optionItemConfigs.configs.map((item, index) => {
      const optionData = optionsData[index];
      const optionId = optionData?.id;

      const nextProps: Record<string, unknown> = {
        ...(item.props ?? {}),
        isChecked: optionId != null && optionId === effectiveSelectedOption,
        isDisabled: pendingOption != null,
      };

      if (onOptionActivated) {
        const onActivatedAsync = async (): Promise<void> => {
          analyticsContext?.setLocalAnalyticsData?.({
            itemPosition: index + 1,
            itemComponentType: componentTypeName(item.componentType),
            ...(typeof optionId === "string" && optionId !== "" ? { id: optionId } : {}),
          });
          await onOptionActivatedHandler(optionId);
        };
        nextProps.onActivated = {
          onActivatedAsync,
          onActivated: () => {
            onActivatedAsync().catch(() => undefined);
          },
        } satisfies SduiResolvedAction;
      }

      const nextConfig: SduiComponentConfig = {
        ...item,
        props: nextProps,
        propSignals: omitPropSignals(item.propSignals, PARENT_OWNED_OPTION_PROPS),
      };

      return nextConfig;
    });

    return {
      configs,
      renderItem: optionItemConfigs.renderItem,
    };
  }, [
    optionItemConfigs,
    optionsData,
    effectiveSelectedOption,
    pendingOption,
    onOptionActivated,
    onOptionActivatedHandler,
    analyticsContext,
  ]);

  const resolvedCollection = useMemo(
    () => expandManagedList(collectionComponent),
    [collectionComponent],
  );

  const resolvedPlaceholder = useMemo(
    () => expandManagedList(placeholderCollectionComponent),
    [placeholderCollectionComponent],
  );

  return (
    <div
      data-testid="sdui-option-selector-collection"
      className={classNames(
        "flex width-full flex-col",
        paddingBetweenOptionSelectorAndCollection == null ? "gap-large" : null,
      )}
      style={
        paddingBetweenOptionSelectorAndCollection != null
          ? { gap: paddingBetweenOptionSelectorAndCollection }
          : undefined
      }
    >
      <SduiVariableItemWidthCarousel
        analyticsContext={analyticsContext}
        componentType={componentType}
        title={title}
        subtitle={subtitle}
        items={optionSelectorItems}
        itemPadding={itemPadding}
        scrollButtonsEnabled={scrollButtonsEnabled}
        impressionEventName={optionImpressionEventName}
        skipItemImpressionsLog={skipOptionItemImpressionsLog}
      />
      <SduiPlaceholderWrapper
        key={effectiveSelectedOption}
        isPlaceholder={pendingOption != null}
        transitionDurationSeconds={placeholderTransitionDurationSeconds}
        mountRealDuringPlaceholder
        real={resolvedCollection}
        placeholder={resolvedPlaceholder}
      />
    </div>
  );
}

export default SduiOptionSelectorCollection;
