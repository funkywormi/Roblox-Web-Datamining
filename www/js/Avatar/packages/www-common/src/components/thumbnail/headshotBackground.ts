/**
 * Avatar headshots include the background unless the caller says otherwise. Case-insensitive:
 * legacy @rbx/thumbnails sends `AvatarHeadshot`, www-common sends `AvatarHeadShot`.
 */
export const resolveIncludeBackground = (
  type: string | undefined,
  includeBackground: boolean | undefined,
): boolean => includeBackground ?? type?.toLowerCase() === "avatarheadshot";
