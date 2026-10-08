import React from "react";
import { Toggle } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import { AvatarType } from "../constants/types";
import { useAvatarPageContext } from "../contexts/AvatarPageContext";
import { useAvatarEditingAccessContext } from "../contexts/AvatarEditingAccessContext";

export type AvatarBodyTypeToggleProps = {
  updateAvatarType: (newAvatarType: AvatarType) => void;
};

const AvatarBodyTypeToggle = (props: AvatarBodyTypeToggleProps): React.ReactElement => {
  const { updateAvatarType } = props;

  const translate = useTranslations("Feature.Avatar");
  const { avatarType } = useAvatarPageContext();
  const { isAvatarEditingBlocked } = useAvatarEditingAccessContext();

  const isR15 = avatarType === "R15";

  return (
    <div className="avatar-type-toggle-scale flex items-center gap-small">
      <span className={`text-body-medium ${isR15 ? "content-muted" : "content-emphasis"}`}>R6</span>
      <Toggle
        size="Medium"
        placement="End"
        aria-label={translate("Label.AvatarBodyType") || "Avatar body type"}
        isChecked={isR15}
        isDisabled={isAvatarEditingBlocked}
        onCheckedChange={isChecked => {
          updateAvatarType(isChecked ? "R15" : "R6");
        }}
      />
      <span className={`text-body-medium ${isR15 ? "content-emphasis" : "content-muted"}`}>
        R15
      </span>
    </div>
  );
};

export default AvatarBodyTypeToggle;
