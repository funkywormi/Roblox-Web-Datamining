/**
 * Renders the server-composed rows in Required and Optional sections. Copy and display order arrive
 * pre-translated. Checked state is keyed by row position because the optional rows share an agreement
 * id and differ only by `target`.
 */

import { useCallback, useEffect, useMemo, useState, type JSX, type MouseEvent } from "react";
import { Button, Checkbox, Divider } from "@rbx/foundation-ui";

import { FullPageChrome } from "../FullPageChrome";
import { renderAnchoredCopy } from "../../utils/anchoredCopy";
import { asConsentRows, asText, type AgreementConsentRow } from "../../utils/nodeDetails";
import type { NodeComponent, NodeProps } from "../../types";

export type AgreementConsentsDetails = {
  headerTitle?: string;
  title: string;
  description: string;
  consentToAllLabel: string;
  requiredSectionLabel: string;
  optionalSectionLabel: string;
  agreeLabel: string;
  backLabel: string;
  rows: AgreementConsentRow[];
};

const CONSENT_TO_ALL_TEST_ID = "amp-v2-wizard-consent-all";
const ROW_TEST_ID_PREFIX = "amp-v2-wizard-consent-row";

function ConsentRow({
  row,
  index,
  isChecked,
  onToggle,
}: {
  row: AgreementConsentRow;
  index: number;
  isChecked: boolean;
  onToggle: (index: number) => void;
}): JSX.Element {
  const checkboxId = `${ROW_TEST_ID_PREFIX}-${index}`;
  const labelId = `${checkboxId}-label`;
  const onCheckedChange = useCallback(() => {
    onToggle(index);
  }, [onToggle, index]);
  const onLabelClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const { target } = event;
      if (!(target instanceof Element) || target.closest("a") == null) {
        onToggle(index);
      }
    },
    [onToggle, index],
  );

  return (
    <div className="gap-medium flex items-start">
      <Checkbox
        id={checkboxId}
        size="Medium"
        placement="Start"
        aria-labelledby={labelId}
        isChecked={isChecked}
        onCheckedChange={onCheckedChange}
        data-testid={checkboxId}
      />
      {/* Foundation's Checkbox label is plain text, so rich text sits beside it. The checkbox uses
          this span as its accessible name and remains the only keyboard toggle. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <span
        id={labelId}
        onClick={onLabelClick}
        className="text-body-medium content-emphasis grow-1 cursor-pointer"
      >
        {renderAnchoredCopy(row.label)}
      </span>
    </div>
  );
}

function ConsentSection({
  label,
  rows,
  isRequired,
  checked,
  onToggle,
}: {
  label: string;
  rows: AgreementConsentRow[];
  isRequired: boolean;
  checked: ReadonlySet<number>;
  onToggle: (index: number) => void;
}): JSX.Element | null {
  // Indices are into the full `rows` list, which is what `checked` and the payload are keyed by.
  const section = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.isRequired === isRequired);
  if (section.length === 0) {
    return null;
  }

  return (
    <div className="gap-large flex flex-col">
      <span className="text-label-medium content-emphasis">{label}</span>
      <div className="gap-medium flex flex-col">
        {section.map(({ row, index }) => (
          <ConsentRow
            key={index}
            row={row}
            index={index}
            isChecked={checked.has(index)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

export const AgreementConsentsNode: NodeComponent = ({
  props,
  report,
  transitions,
}: NodeProps): JSX.Element => {
  const headerTitle = asText(props.headerTitle);
  const title = asText(props.title) ?? "";
  const description = asText(props.description);
  const consentToAllLabel = asText(props.consentToAllLabel) ?? "";
  const requiredSectionLabel = asText(props.requiredSectionLabel) ?? "";
  const optionalSectionLabel = asText(props.optionalSectionLabel) ?? "";
  const agreeLabel = asText(props.agreeLabel) ?? "";

  const rows = useMemo(() => asConsentRows(props.rows) ?? [], [props.rows]);
  const [checked, setChecked] = useState<ReadonlySet<number>>(() => new Set());

  useEffect(() => {
    setChecked(new Set());
  }, [props.rows]);

  const requiredIndices = useMemo(
    () => rows.map((row, index) => ({ row, index })).filter(({ row }) => row.isRequired),
    [rows],
  );
  const canAgree = requiredIndices.every(({ index }) => checked.has(index));
  const allChecked = rows.length > 0 && checked.size === rows.length;

  const onToggleRow = useCallback((index: number) => {
    setChecked(current => {
      const next = new Set(current);
      if (!next.delete(index)) {
        next.add(index);
      }
      return next;
    });
  }, []);

  const onToggleAll = useCallback(() => {
    setChecked(current =>
      current.size === rows.length ? new Set() : new Set(rows.map((_, index) => index)),
    );
  }, [rows]);

  const onAgree = useCallback(() => {
    const acceptedRows = rows
      .filter((_, index) => checked.has(index))
      .map(row => ({ id: row.id, target: row.target }));
    report("Agree", { acceptedRows });
  }, [rows, checked, report]);

  const onBack = useCallback(() => {
    report("Back");
  }, [report]);

  const hasBack = transitions?.Back != null;

  return (
    <FullPageChrome title={headerTitle} onBack={hasBack ? onBack : undefined}>
      <div className="gap-large flex grow flex-col" data-testid="amp-v2-wizard-agreement-consents">
        <div className="gap-xlarge flex flex-col">
          <div className="gap-none flex flex-col">
            <h2 className="text-heading-medium content-emphasis margin-none">{title}</h2>
            {description ? (
              <p className="text-body-large content-default margin-none">{description}</p>
            ) : null}
          </div>
          <Checkbox
            size="Medium"
            placement="Start"
            label={consentToAllLabel}
            isChecked={allChecked}
            onCheckedChange={onToggleAll}
            data-testid={CONSENT_TO_ALL_TEST_ID}
          />
          <Divider />
          <ConsentSection
            label={requiredSectionLabel}
            rows={rows}
            isRequired
            checked={checked}
            onToggle={onToggleRow}
          />
          <ConsentSection
            label={optionalSectionLabel}
            rows={rows}
            isRequired={false}
            checked={checked}
            onToggle={onToggleRow}
          />
        </div>
        <div className="gap-small flex flex-col [margin-top:auto]">
          <Button
            variant="Emphasis"
            size="Medium"
            className="width-full"
            isDisabled={!canAgree}
            onClick={onAgree}
          >
            {agreeLabel}
          </Button>
        </div>
      </div>
    </FullPageChrome>
  );
};

// Renders its own full-page surface (FullPageChrome): the host must not add a modal overlay, nor a
// loading spinner that would mis-position against this fixed, out-of-flow node.
AgreementConsentsNode.ownsOverlay = true;
AgreementConsentsNode.ownsLoadingState = true;
