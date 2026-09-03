import { useMemo, useState } from "react";
import { List } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useSystemFeedback } from "@rbx/core-ui";
import { useChangeDisplayNameModal } from "@rbx/user-settings";
import EditUserBioModal from "@rbx/profile-common/EditUserBioModal";

import ProfileAvatar from "./components/ProfileAvatar";
import ProfileSettingRow from "./components/ProfileSettingRow";
import EditProfileBackAffordance from "./components/EditProfileBackAffordance";
import useAgedUpDisplayNames from "./hooks/useAgedUpDisplayNames";
import useUserProfileData from "./hooks/useUserProfileData";

const EditUserProfileContainer = () => {
  const { translate } = useTranslation();
  const { SystemFeedbackComponent, systemFeedbackService } = useSystemFeedback();
  const hasAgedUpDisplayNames = useAgedUpDisplayNames();
  const { userId, displayName, username, description, refetchDescription, refetchDisplayName } =
    useUserProfileData();
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [displayNameModal, displayNameModalService] = useChangeDisplayNameModal({
    showAgedUpDisplayName: hasAgedUpDisplayNames,
    translatedTitle: translate(
      hasAgedUpDisplayNames ? "Label.AgedUpConfigureDN" : "Label.ConfigureDN",
    ),
    translatedDescription: translate("Description.WarningFrequencyOfChanges"),
    translatedSaveButtonText: translate("Action.Save"),
    onSuccess: () => {
      refetchDisplayName().catch(() => undefined);
      systemFeedbackService.success(translate("Response.Dialog.DefaultSuccessMessage"));
    },
    translatedClearButtonAriaLabel: translate("Label.Clear"),
  });

  const displayNameLabel = translate(
    hasAgedUpDisplayNames ? "Label.AgedUpDisplayNameV2" : "Label.DisplayNameSettingV2",
  );

  const bioValue = useMemo(() => {
    if (description === undefined) {
      return undefined;
    }
    if (!description) {
      return translate("Label.NoBio");
    }
    return description;
  }, [description, translate]);

  const onBioUpdated = () => {
    refetchDescription().catch(() => undefined);
    systemFeedbackService.success(translate("Description.AboutSuccess"));
  };

  return (
    <div className="min-height-full bg-surface-sunken-0 padding-xlarge">
      <SystemFeedbackComponent />
      <div className="max-width-[970px] margin-x-auto">
        {/* Back Affordance */}
        <EditProfileBackAffordance />
        {/* Avatar Section */}
        <div className="flex justify-center padding-bottom-xlarge">
          <ProfileAvatar userId={userId} displayName={displayName} />
        </div>

        {/* Settings List */}
        <List className="width-full bg-shift-100 flex flex-col radius-large clip">
          <ProfileSettingRow
            label={displayNameLabel}
            value={displayName}
            onClick={() => {
              displayNameModalService.open();
            }}
          />
          <ProfileSettingRow
            label={translate("Label.UsernameV2")}
            value={username ? `@${username}` : ""}
            onClick={() => {
              window.location.href = "/my/account#!/info?changeusername";
            }}
          />
          <ProfileSettingRow
            label={translate("Label.About")}
            value={bioValue}
            onClick={() => {
              setIsBioModalOpen(true);
            }}
          />
          <ProfileSettingRow
            label={translate("Action.EditAvatar")}
            onClick={() => {
              window.location.href = "/my/avatar";
            }}
            divider="None"
          />
        </List>
      </div>
      {displayNameModal}
      {isBioModalOpen && (
        <EditUserBioModal
          open={isBioModalOpen}
          onClose={() => {
            setIsBioModalOpen(false);
          }}
          onBioUpdated={onBioUpdated}
          initialBio={description}
        />
      )}
    </div>
  );
};

export default EditUserProfileContainer;
