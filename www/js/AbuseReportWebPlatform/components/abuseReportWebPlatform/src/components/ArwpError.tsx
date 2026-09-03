import { ReactElement } from "react";
import { Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

interface ArwpErrorProps {
  text: string;
}

const ArwpError = ({ text }: ArwpErrorProps): ReactElement => (
  <div className="bg-surface-100 padding-large radius-medium">
    <Icon name="icon-regular-triangle-exclamation" size="Large" />
    <div className="error-message">{text}</div>
  </div>
);

const ArwpGenericError = (): ReactElement => {
  const { translate } = useTranslation();
  return <ArwpError text={translate("Message.SomethingWentWrong")} />;
};

export { ArwpError, ArwpGenericError };
