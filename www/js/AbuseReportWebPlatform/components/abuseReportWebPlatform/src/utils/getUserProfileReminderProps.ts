import { ThumbnailAvatarHeadshotSize, ThumbnailTypes } from "@rbx/thumbnails";
import dataStore from "@rbx/core-scripts/data-store";
import { ArwpReminderRenderProps } from "./types";

const getUserProfileReminderProps = async (
  userId: number,
): Promise<ArwpReminderRenderProps | null> => {
  try {
    const userRes = await dataStore.userDataStore.getUser(userId);
    return {
      title: userRes.displayName,
      message: `@${userRes.name}`,
      thumbnailProps: {
        containerClass: "radius-circle size-1200",
        size: ThumbnailAvatarHeadshotSize.size48,
        targetId: userRes.id.toString(),
        type: ThumbnailTypes.avatarHeadshot,
      },
    };
  } catch {
    return null;
  }
};

export default getUserProfileReminderProps;
