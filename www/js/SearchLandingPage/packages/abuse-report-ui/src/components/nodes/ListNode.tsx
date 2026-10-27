import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Icon,
  List,
  ListItem,
  ListItemRadioAccessory,
  ProgressCircle,
} from "@rbx/foundation-ui";
import { useArTranslation } from "../../util/translate/arTranslation";
import { TranslateInputOrString } from "../../util/translate/translate";
import { useAbuseReportAnalytics } from "../../analytics/AbuseReportAnalyticsContext";
import { useListLoader } from "../../loaders/useLoader";
import Eyebrow from "../Eyebrow";
import Footer, { type FooterItem } from "../Footer";
import Subtitle, { type SubtitleValue } from "../Subtitle";
import { useLayoutSlots } from "../LayoutSlots";

export type ListItem = {
  id: string;
  label: TranslateInputOrString;
  description?: TranslateInputOrString;
};

type LoadDescriptor = {
  $load: string;
  params?: Record<string, string>;
};

/**
 * AR List Node - shows a list of options to the user.
 * Supports both static item arrays and `$load` descriptors for async loading.
 */
const ListNode = ({
  onNext,
  isSubmitting,
  title,
  subtitle,
  eyebrow,
  items: rawItems,
  initialValue,
  nextButtonText,
  errorText,
  retryButtonText,
  emptyText,
  required,
  footerItems,
  variant = "radio",
}: {
  onNext?: (componentData: { selectionItem?: ListItem }) => void;
  isSubmitting?: boolean;
  title: TranslateInputOrString;
  subtitle?: SubtitleValue;
  eyebrow?: TranslateInputOrString;
  items: (ListItem | undefined)[] | LoadDescriptor;
  initialValue?: string;
  nextButtonText: TranslateInputOrString;
  errorText?: TranslateInputOrString;
  retryButtonText?: TranslateInputOrString;
  emptyText?: TranslateInputOrString;
  /**
   * If required, the next button will only show after an item is selected.
   * Ignored for `chevron` variant (selection advances immediately).
   */
  required?: boolean;
  footerItems?: FooterItem[];
  /** `"radio"` (default) requires Continue; `"chevron"` advances on item click. */
  variant?: "chevron" | "radio";
}): React.ReactElement => {
  const [selectedId, setSelectedId] = useState<string | undefined>(initialValue);
  const elementsRef = useRef<Record<string, HTMLElement | null>>({});
  const didScrollRef = useRef(false);
  const { translate, translateToStringOnly } = useArTranslation();
  const { Body, Actions, Description } = useLayoutSlots();
  const { sendEvent, EventName } = useAbuseReportAnalytics();

  const { data, loading, error, retry } = useListLoader(rawItems);
  const items = data ?? [];
  const isChevron = variant === "chevron";
  const isEmpty = items.length === 0;

  const header = (
    <div className="padding-x-xlarge">
      <Eyebrow eyebrow={eyebrow} />
      <Description>
        <div>
          <h3 className="text-heading-medium margin-y-none padding-bottom-medium">
            {translate(title)}
          </h3>
          <Subtitle subtitle={subtitle} />
        </div>
      </Description>
    </div>
  );

  const [bodyEl, setBodyEl] = useState<HTMLDivElement | null>(null);

  /**
   * The body is not immediately rendered on open, so we'll need to use a callback ref to determine
   * both:
   * 1. The dialog has opened
   * 2. The dialog body is available
   *
   * Then we'll use a separate `useEffect` to setup element listeners.
   */
  const onRefCallback = (ref: HTMLDivElement | null) => {
    setBodyEl(ref);
  };

  useEffect(() => {
    if (!bodyEl) return;

    const handleScroll = () => {
      didScrollRef.current = true;
    };

    bodyEl.addEventListener("scroll", handleScroll);
    return () => {
      bodyEl.removeEventListener("scroll", handleScroll);
    };
  }, [bodyEl]);

  const emitSelectItem = (item: ListItem) => {
    const index = items.findIndex(i => i.id === item.id);
    const hasScroll = bodyEl ? bodyEl.scrollHeight > bodyEl.clientHeight : false;
    const didScroll = didScrollRef.current;

    sendEvent(EventName.SelectItem, {
      selected_index: index + 1,
      list_length: items.length,
      has_scroll: hasScroll,
      did_scroll: didScroll,
    });
  };

  const handleSelect = (item: ListItem) => {
    if (isSubmitting) return;
    emitSelectItem(item);
    setSelectedId(item.id);
  };

  const handleChevronSelect = (item: ListItem) => {
    if (isSubmitting) return;
    emitSelectItem(item);
    onNext?.({ selectionItem: item });
  };

  useEffect(() => {
    if (selectedId) {
      const element = elementsRef.current[selectedId];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedId]);

  if (loading) {
    return (
      <Body>
        {header}
        <div className="flex items-center justify-center padding-y-xxlarge">
          <ProgressCircle ariaLabel="Loading" variant="Indeterminate" />
        </div>
      </Body>
    );
  }

  if (error) {
    return (
      <Body>
        {header}
        <div className="flex flex-col items-center gap-medium padding-y-xlarge">
          {errorText && <p className="text-body-small content-muted">{translate(errorText)}</p>}
          {retryButtonText && (
            <Button variant="Standard" size="Small" onClick={retry}>
              {translate(retryButtonText)}
            </Button>
          )}
        </div>
      </Body>
    );
  }

  // Empty + required: no Continue (dead-end avoided by emptyText UX).
  // Empty + optional: Continue still shown so the user can proceed without a selection.
  const showContinue = !isChevron && onNext && (selectedId !== undefined || !required);

  return (
    <React.Fragment>
      <Body ref={onRefCallback} hasPaddingX={false}>
        {header}
        {isEmpty ? (
          emptyText ? (
            <div className="padding-x-xlarge padding-y-xlarge text-body-small content-muted">
              {translate(emptyText)}
            </div>
          ) : null
        ) : (
          <List className="[&>*]:[scroll-margin:var(--padding-small)]">
            {items.map(item => {
              const isSelected = selectedId === item.id;
              return (
                <ListItem
                  ref={(el: HTMLElement | null) => {
                    elementsRef.current[item.id] = el;
                  }}
                  key={`list-item-${item.id}`}
                  isContained={false}
                  divider="Inset"
                  title={translateToStringOnly(item.label)}
                  description={
                    item.description ? translateToStringOnly(item.description) : undefined
                  }
                  onSelect={() => {
                    if (isChevron) {
                      handleChevronSelect(item);
                    } else {
                      handleSelect(item);
                    }
                  }}
                  trailing={
                    isChevron ? (
                      <Icon name="icon-regular-chevron-large-right" />
                    ) : (
                      <ListItemRadioAccessory isSelected={isSelected} />
                    )
                  }
                />
              );
            })}
          </List>
        )}
        {/* Body has hasPaddingX={false} for edge-to-edge list items; restore inset for footer. */}
        {footerItems != null && footerItems.length > 0 ? (
          <div className="padding-x-xlarge padding-top-medium">
            <Footer items={footerItems} />
          </div>
        ) : null}
      </Body>
      {showContinue && (
        <Actions>
          <Button
            className="width-full"
            onClick={() => {
              const selectedItem = items.find(item => item.id === selectedId);
              onNext({
                selectionItem: selectedItem,
              });
            }}
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {translate(nextButtonText)}
          </Button>
        </Actions>
      )}
    </React.Fragment>
  );
};

export default ListNode;
