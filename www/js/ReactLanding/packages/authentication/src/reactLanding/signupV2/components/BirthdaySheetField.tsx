import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  Button,
  Icon,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetRoot,
  SheetTitle,
  TextInput,
} from "@rbx/foundation-ui";
import type { SignUpFormV2BirthdayField, SignUpFormV2BirthdayFieldName } from "./SignUpFormV2";

type BirthdayDraft = Record<SignUpFormV2BirthdayFieldName, string>;

export type BirthdaySheetFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  sheetTitle: string;
  doneLabel: string;
  closeLabel: string;
  fields: ReadonlyArray<SignUpFormV2BirthdayField>;
  error?: string;
  isDisabled?: boolean;
  onBirthdayChange: (field: SignUpFormV2BirthdayFieldName, value: string) => void;
};

const getDraft = (fields: ReadonlyArray<SignUpFormV2BirthdayField>): BirthdayDraft =>
  fields.reduce<BirthdayDraft>((draft, field) => ({ ...draft, [field.name]: field.value }), {
    day: "",
    month: "",
    year: "",
  });

const scrollSettleDelayMs = 100;

const getWheelTitle = (title: string): string => title.replace(/^0+(?=\d)/, "");

const getPlaceholderTitle = (name: SignUpFormV2BirthdayFieldName): string =>
  name === "day" ? "--" : "----";

// The fields arrive in the locale's date order, so joining their titles reads naturally.
const formatBirthday = (fields: ReadonlyArray<SignUpFormV2BirthdayField>): string => {
  const titles = fields.map(
    field => field.options.find(option => option.value === field.value)?.title,
  );
  return titles.every(Boolean) ? titles.map(title => getWheelTitle(title ?? "")).join(" ") : "";
};

const getRows = (list: HTMLElement): HTMLElement[] =>
  Array.from(list.querySelectorAll<HTMLElement>("[data-value]"));

const getRowScrollTop = (list: HTMLElement, row: HTMLElement): number =>
  row.offsetTop - (list.clientHeight - row.offsetHeight) / 2;

const getCenteredRow = (list: HTMLElement): HTMLElement | undefined => {
  const distanceFromCenter = (row: HTMLElement): number =>
    Math.abs(getRowScrollTop(list, row) - list.scrollTop);
  return getRows(list).reduce<HTMLElement | undefined>(
    (closest, row) =>
      !closest || distanceFromCenter(row) < distanceFromCenter(closest) ? row : closest,
    undefined,
  );
};

type BirthdayWheelColumnProps = {
  groupId: string;
  field: SignUpFormV2BirthdayField;
  value: string;
  onSelect: (value: string) => void;
  onSettlingChange: (isSettling: boolean) => void;
};

const BirthdayWheelColumn = ({
  groupId,
  field,
  value,
  onSelect,
  onSettlingChange,
}: BirthdayWheelColumnProps): JSX.Element => {
  const listRef = useRef<HTMLDivElement>(null);
  const hasScrolledToValueRef = useRef(false);
  const settleTimeoutRef = useRef<number>();

  useEffect(() => {
    const list = listRef.current;
    const row = list && getRows(list).find(candidate => candidate.dataset.value === value);
    if (!list || !row || getCenteredRow(list) === row) {
      hasScrolledToValueRef.current = true;
      return;
    }
    const top = getRowScrollTop(list, row);
    if (hasScrolledToValueRef.current) {
      list.scrollTo({ top, behavior: "smooth" });
    } else {
      list.scrollTop = top;
      hasScrolledToValueRef.current = true;
    }
  }, [value]);

  useEffect(() => () => window.clearTimeout(settleTimeoutRef.current), []);

  const handleScroll = (): void => {
    if (settleTimeoutRef.current === undefined) {
      onSettlingChange(true);
    }
    window.clearTimeout(settleTimeoutRef.current);
    settleTimeoutRef.current = window.setTimeout(() => {
      settleTimeoutRef.current = undefined;
      const row = listRef.current && getCenteredRow(listRef.current);
      const centeredValue = row?.dataset.value;
      if (centeredValue !== undefined && centeredValue !== value) {
        onSelect(centeredValue);
      }
      onSettlingChange(false);
    }, scrollSettleDelayMs);
  };

  return (
    <div
      ref={listRef}
      role="radiogroup"
      aria-label={field.label}
      onScroll={handleScroll}
      className="relative flex min-width-0 grow-1 basis-0 flex-col height-[240px] [padding-block:96px] scroll-y [scroll-snap-type:y_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      data-testid={`birthday-sheet-${field.name}`}
    >
      <div
        aria-hidden="true"
        data-value=""
        onClick={() => onSelect("")}
        className="flex shrink-0 items-center justify-center height-[48px] [scroll-snap-align:center] content-muted text-body-large cursor-pointer"
      >
        {getPlaceholderTitle(field.name)}
      </div>
      {field.options.map(option => {
        const isSelected = option.value === value;
        return (
          <label
            key={option.value}
            data-value={option.value}
            className={`flex shrink-0 items-center justify-center height-[48px] margin-none [scroll-snap-align:center] cursor-pointer ${
              isSelected ? "text-title-large content-emphasis" : "text-body-large content-default"
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              name={groupId}
              value={option.value}
              checked={isSelected}
              onChange={() => onSelect(option.value)}
            />
            {getWheelTitle(option.title)}
          </label>
        );
      })}
    </div>
  );
};

const BirthdaySheetField = ({
  id,
  label,
  placeholder,
  sheetTitle,
  doneLabel,
  closeLabel,
  fields,
  error,
  isDisabled = false,
  onBirthdayChange,
}: BirthdaySheetFieldProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<BirthdayDraft>(() => getDraft(fields));
  const [settlingWheels, setSettlingWheels] = useState<
    Partial<Record<SignUpFormV2BirthdayFieldName, boolean>>
  >({});
  const isDraftComplete = fields.every(field => Boolean(draft[field.name]));
  // A wheel only reports the row it stops on once scrolling settles, so until then the draft
  // still holds the row it left.
  const isAnyWheelSettling = Object.values(settlingWheels).some(Boolean);

  const setSheetOpen = (nextIsOpen: boolean): void => {
    if (nextIsOpen === isOpen) {
      return;
    }
    if (nextIsOpen) {
      setDraft(getDraft(fields));
      setSettlingWheels({});
    }
    setIsOpen(nextIsOpen);
    fields.forEach(field => field.onOpenChange?.(nextIsOpen));
  };

  const handleDone = (): void => {
    fields.forEach(field => {
      if (draft[field.name] !== field.value) {
        onBirthdayChange(field.name, draft[field.name]);
      }
    });
    setSheetOpen(false);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      // Enter would otherwise submit the surrounding form.
      event.preventDefault();
      setSheetOpen(true);
    }
  };

  return (
    <React.Fragment>
      <TextInput
        id={id}
        name="signupBirthday"
        type="text"
        size="Medium"
        label={label}
        placeholder={placeholder}
        isRequired
        readOnly
        value={formatBirthday(fields)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setSheetOpen(true)}
        onKeyDown={handleTriggerKeyDown}
        isDisabled={isDisabled}
        hasError={Boolean(error)}
        error={error}
        trailingIconNode={
          <Icon
            name="icon-regular-calendar"
            size="Small"
            className="pointer-events-none"
            aria-hidden="true"
          />
        }
      />
      <SheetRoot open={isOpen} onOpenChange={setSheetOpen}>
        <SheetContent centerSheetSize="Medium" closeLabel={closeLabel} largeScreenVariant="center">
          <SheetTitle>{sheetTitle}</SheetTitle>
          <SheetBody>
            <div className="relative flex width-full gap-small padding-bottom-medium">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute height-[48px] [inset:96px_0_auto_0] [border-block:1px_solid_var(--color-stroke-default)]"
              />
              {fields.map(field => (
                <BirthdayWheelColumn
                  key={field.name}
                  groupId={`${id}-${field.name}`}
                  field={field}
                  value={draft[field.name]}
                  onSelect={value => setDraft(current => ({ ...current, [field.name]: value }))}
                  onSettlingChange={isSettling =>
                    setSettlingWheels(current => ({ ...current, [field.name]: isSettling }))
                  }
                />
              ))}
            </div>
          </SheetBody>
          <SheetActions>
            <Button
              type="button"
              className="width-full"
              size="Medium"
              variant="Emphasis"
              isDisabled={!isDraftComplete || isAnyWheelSettling}
              onClick={handleDone}
            >
              {doneLabel}
            </Button>
          </SheetActions>
        </SheetContent>
      </SheetRoot>
    </React.Fragment>
  );
};

export default BirthdaySheetField;
