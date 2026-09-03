import { useTranslation } from "@rbx/core-scripts/react";
import { Icon, Button } from "@rbx/foundation-ui";
import { useCallback } from "react";

const ErrorView = () => {
  const { translate } = useTranslation();

  const onClickBack = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <div className="height-[210px] gap-y-small margin-top-[240px] flex flex-col items-center">
      <Icon className="content-muted !size-1400" name="icon-regular-triangle-exclamation" />
      <p className="text-heading-small">{translate("Message.Error.Generic")}</p>
      <div className="gap-x-medium padding-top-medium flex">
        <Button
          className="min-width-[96px]"
          size="Small"
          variant="SoftEmphasis"
          onClick={onClickBack}
        >
          {translate("Action.Back")}
        </Button>
        <Button as="a" className="min-width-[96px]" href="/home" size="Small" variant="Standard">
          {translate("Action.Home")}
        </Button>
      </div>
    </div>
  );
};

export default ErrorView;
