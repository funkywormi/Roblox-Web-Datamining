interface Props {
  fieldLabel: string;
  fieldValue: string;
  /**
   * In some cases, we want to preserve line breaks in the value in order to keep the intended formatting.
   * Example: For moderator notes, some messages include paragraphs broken up by \n characters.
   */
  preline?: boolean;
}

/**
 * A component that displays a label-value pair in a consistent format. Used for displaying
 * evidence details across different page item configs.
 *
 * This simple logic was mainly created to avoid having to change the typography variants across
 * multiple files.
 */
const EvidenceField = ({ fieldLabel, fieldValue, preline = false }: Props): JSX.Element => {
  const labelWithColon = `${fieldLabel}:`;

  return (
    <div className="flex flex-col">
      <span className="text-title-medium">{labelWithColon}</span>
      <p
        className="text-body-medium"
        style={{
          wordBreak: "break-word",
          whiteSpace: preline ? "pre-line" : "normal",
        }}
      >
        {fieldValue}
      </p>
    </div>
  );
};

export default EvidenceField;
