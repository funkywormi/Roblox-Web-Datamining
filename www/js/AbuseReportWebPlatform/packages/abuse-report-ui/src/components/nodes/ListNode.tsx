import React, { useEffect, useRef, useState } from "react";
import { Button, List, ListItem, ListItemRadioAccessory, ProgressCircle } from "@rbx/foundation-ui";
import { useArTranslation } from "../../util/translate/arTranslation";
import { TranslateInputOrString } from "../../util/translate/translate";
import { useAbuseReportAnalytics } from "../../analytics/AbuseReportAnalyticsContext";
import { useListLoader } from "../../loaders/useLoader";
import Eyebrow from "../Eyebrow";
import Footer from "../Footer";
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
  eyebrow,
  items: rawItems,
  initialValue,
  nextButtonText,
  errorText,
  retryButtonText,
  required,
  footerItems,
}: {
  onNext?: (componentData: { selectionItem?: ListItem }) => void;
  isSubmitting?: boolean;
  title: TranslateInputOrString;
  eyebrow?: TranslateInputOrString;
  items: (ListItem | undefined)[] | LoadDescriptor;
  initialValue?: string;
  nextButtonText: TranslateInputOrString;
  errorText?: TranslateInputOrString;
  retryButtonText?: TranslateInputOrString;
  /**
   * If required, the next button will only show after an item is selected.
   */
  required?: boolean;
  footerItems?: TranslateInputOrString[];
}): React.ReactElement => {
  const [selectedId, setSelectedId] = useState<string | undefined>(initialValue);
  const elementsRef = useRef<Record<string, HTMLElement | null>>({});
  const didScrollRef = useRef(false);
  const { translate, translateToStringOnly } = useArTranslation();
  const { Body, Actions, Description } = useLayoutSlots();
  const { sendEvent, EventName } = useAbuseReportAnalytics();

  const { data, loading, error, retry } = useListLoader(rawItems);
  const items = data ?? [];

  const header = (
    <div className="padding-x-xlarge">
      <Eyebrow eyebrow={eyebrow} />
      <Description>
        <h3 className="text-heading-medium margin-y-none padding-bottom-medium">
          {translate(title)}
        </h3>
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

  const handleSelect = (item: ListItem) => {
    const index = items.findIndex(i => i.id === item.id);
    const hasScroll = bodyEl ? bodyEl.scrollHeight > bodyEl.clientHeight : false;
    const didScroll = didScrollRef.current;

    sendEvent(EventName.SelectItem, {
      selected_index: index + 1,
      list_length: items.length,
      has_scroll: hasScroll,
      did_scroll: didScroll,
    });

    setSelectedId(item.id);
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

  return (
    <React.Fragment>
      <Body ref={onRefCallback} hasPaddingX={false}>
        {header}
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
                description={item.description ? translateToStringOnly(item.description) : undefined}
                onSelect={() => {
                  handleSelect(item);
                }}
                trailing={<ListItemRadioAccessory isSelected={isSelected} />}
              />
            );
          })}
        </List>
        <Footer items={footerItems} />
      </Body>
      {onNext && (selectedId !== undefined || !required) && (
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
