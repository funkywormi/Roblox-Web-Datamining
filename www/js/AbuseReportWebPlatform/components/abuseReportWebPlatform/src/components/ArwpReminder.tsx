import { useQuery } from "@tanstack/react-query";
import { Thumbnail2d, ThumbnailFormat } from "@rbx/thumbnails";
import { arrayIncludes } from "@rbx/core-types";
import { Skeleton } from "@rbx/ui";
import { useSearchParams } from "../context/ArwpUrlParamProvider";
import {
  ABUSE_VECTORS_WITH_REMINDERS,
  getReminderComponentAbuseVectorConfig,
} from "../utils/getReminderComponentConfig";

/**
 * The reminder component is displayed at the top of the abuse report flow for certain abuse vectors.
 * It 'reminds' the user what they're reporting like:
 * - Reporting a user profile : shows the user's name, display name, and avatar
 * @returns Either the reminder component or null if no reminder is needed
 */
const ArwpReminder = () => {
  const { abuseVector, targetId, customParams } = useSearchParams();

  const { data: renderProps, isLoading } = useQuery({
    queryKey: ["arwpReminderRenderProps", abuseVector, targetId],
    queryFn: () =>
      getReminderComponentAbuseVectorConfig(abuseVector, Number(targetId), customParams),
    enabled: arrayIncludes(ABUSE_VECTORS_WITH_REMINDERS, abuseVector),
  });

  const { title, subtitle, message, thumbnailProps } = renderProps ?? {};
  const hasContent = title ?? subtitle ?? message ?? thumbnailProps;
  if (!arrayIncludes(ABUSE_VECTORS_WITH_REMINDERS, abuseVector) || (!isLoading && !hasContent)) {
    return null;
  }

  return (
    <div className="items-center bg-surface-100 padding-small gap-small radius-medium flex flex-row">
      {isLoading ? (
        <div className="flex-row gap-small inline-flex items-center">
          <Skeleton animate variant="circular" width={48} height={48} />
          <div className="flex flex-col">
            <Skeleton animate variant="text" width={120} height={24} />
            <Skeleton animate variant="text" width={100} height={20} />
          </div>
        </div>
      ) : null}
      {thumbnailProps?.targetId && thumbnailProps.type && (
        // Thumbnail2d currently has resizing issues with its shimmer effect, so need to wrap in div
        <div className={thumbnailProps.containerClass}>
          <Thumbnail2d
            containerClass={thumbnailProps.containerClass}
            format={ThumbnailFormat.webp}
            size={thumbnailProps.size}
            targetId={thumbnailProps.targetId}
            type={thumbnailProps.type}
          />
        </div>
      )}
      <div className="inline-flex flex-col">
        {title && <div className="text-heading-small text-wrap">{title}</div>}
        {subtitle && <div className="text-body-large text-wrap">{subtitle}</div>}
        {message && <div className="text-body-small text-wrap">{message}</div>}
      </div>
    </div>
  );
};

export default ArwpReminder;
