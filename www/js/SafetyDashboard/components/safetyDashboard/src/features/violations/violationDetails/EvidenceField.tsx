interface Props {
  fieldLabel: string;
  fieldValue: string | undefined;
  preWrap?: boolean;
  size?: "small" | "medium";
}

/**
 * A component that displays a label-value pair in a consistent format. Used for displaying
 * evidence details across different components.
 *
 * This simple logic was mainly created to avoid having to change the typography variants across
 * multiple files.
 */
const EvidenceField = ({
  fieldLabel,
  fieldValue,
  preWrap = false,
  size = "medium",
}: Props): JSX.Element => {
  // In the future, this should be added to the translations themselves.
  const labelWithColon = `${fieldLabel}:`;

  return (
    <div className="flex flex-col">
      <span className={`text-title-${size}`}>{labelWithColon}</span>
      <p
        className={`text-body-${size}`}
        style={{
          wordBreak: "break-word",
          whiteSpace: preWrap ? "pre-wrap" : "normal",
        }}
      >
        {fieldValue ?? ""}
      </p>
    </div>
  );
};

export default EvidenceField;
