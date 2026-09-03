export type ArwpConfigurableComponentSubtextProps = {
  isOptional: boolean;
  requirementMessage: string;
  isErrorState: boolean;
};

// TODO: Get rid of all CSS
const ArwpConfigurableComponentSubtext = ({
  isOptional,
  requirementMessage,
  isErrorState,
}: ArwpConfigurableComponentSubtextProps) => {
  let textComponent = <span />;
  if (isOptional) {
    textComponent = <span className="text-body-small">{requirementMessage}</span>;
  } else if (isErrorState) {
    textComponent = (
      <span className="content-action-alert text-body-small">{requirementMessage}</span>
    );
  }
  return textComponent;
};

export default ArwpConfigurableComponentSubtext;
