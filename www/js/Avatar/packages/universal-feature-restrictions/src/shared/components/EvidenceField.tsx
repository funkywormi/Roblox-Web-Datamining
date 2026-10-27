const COLON = ":";

interface Props {
  fieldLabel: string;
  fieldValue: string;
  hasColon?: boolean;
  /**
   * In some cases, we want to preserve line breaks in the value in order to keep the intended formatting.
   * Example: For moderator notes, some messages include paragraphs broken up by \n characters.
   */
  preline?: boolean;
}
/**
 * A simple label-value pair display component to make it easier to standardize the
 * typography across the dialog.
 */
const EvidenceField = ({ fieldLabel, fieldValue, hasColon = true, preline = false }: Props) => {
  return (
    <div className="flex flex-col gap-xxsmall">
      <span className="text-title-medium content-emphasis margin-none">
        {fieldLabel}
        {hasColon && COLON}
      </span>
      <p
        className="text-body-medium content-default margin-none"
        style={{ wordBreak: "break-word", whiteSpace: preline ? "pre-line" : "normal" }}
      >
        {fieldValue}
      </p>
    </div>
  );
};

export default EvidenceField;
