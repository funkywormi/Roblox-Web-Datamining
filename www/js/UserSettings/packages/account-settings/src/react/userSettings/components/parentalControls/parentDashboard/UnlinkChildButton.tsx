import React from "react";
import { Button } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import useSettingsModal from "../../../../common/hooks/modals/useSettingsModal";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";

const UnlinkChildButton = ({
  child,
  handleUnlinkChild,
}: {
  child: TChildInfo;
  handleUnlinkChild: (childUserId: number) => void;
}): JSX.Element => {
  const { translate } = useTranslation();
  const { unlinkChildAccount } = parentalControlsTranslationConstants;

  const [confirmUnlinkModal, confirmUnlinkModalService] = useSettingsModal({
    translatedTitle: translate(unlinkChildAccount.modal.title, { childName: child.displayName }),
    bodyResourceId: unlinkChildAccount.modal.description,
    onAction: () => handleUnlinkChild(child.userId),
    size: "sm",
    actionButtonTextResourceId: unlinkChildAccount.action,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
  });

  return (
    <div>
      <Button
        variant={Button.variants.control}
        size={Button.sizes.medium}
        width={Button.widths.full}
        onClick={() => {
          confirmUnlinkModalService.open();
        }}
      >
        {translate(unlinkChildAccount.action)}
      </Button>
      {confirmUnlinkModal}
    </div>
  );
};

export default UnlinkChildButton;
