import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
} from "roblox-thumbnails";
import { useTranslation } from "react-utilities";
import {
  ListItem,
  ListItemChevronTrailingAccessory,
  ListItemLeadingAccessorySpacer,
} from "@rbx/foundation-ui";
import { TParentInfo } from "../../../../../types/parentInfoTypes";
import { getProfileUrl } from "../../../constants/urlConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { useGetSettingsUiPolicyQuery } from "../../../../apis/universalAppConfigurationApi";

export const LinkedParentListItem = ({ parent }: { parent: TParentInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();

  return (
    <ListItem
      className="bg-shift-100 radius-medium clip"
      isContained={false}
      size="Large"
      divider="None"
      title={parent.displayName}
      metadata={parent.email}
      description={
        uiPolicy?.enableChildSideParentDigestEmails && parent.isReceivingDigestEmails
          ? translate(parentalControlsTranslationConstants.parentReceivingDigestEmails)
          : undefined
      }
      leading={
        <ListItemLeadingAccessorySpacer>
          <div className="size-1400 radius-circle clip">
            <Thumbnail2d
              containerClass="size-full"
              type={ThumbnailTypes.avatarHeadshot}
              size={ThumbnailAvatarHeadshotSize.size150}
              targetId={parent.userId}
              format={ThumbnailFormat.webp}
              imgClassName="size-full"
            />
          </div>
        </ListItemLeadingAccessorySpacer>
      }
      trailing={<ListItemChevronTrailingAccessory />}
      onSelect={() => {
        // Profiles are outside this SPA, so use a full-page navigation.
        window.location.href = getProfileUrl(parent.userId);
      }}
    />
  );
};

export default LinkedParentListItem;
