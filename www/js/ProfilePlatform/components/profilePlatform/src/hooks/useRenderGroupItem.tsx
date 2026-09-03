import { Fragment, useCallback, useRef } from "react";
import { ThumbnailTypes } from "@rbx/thumbnails";
import { truncNumber, SuffixNames } from "@rbx/core-scripts/format/number";
import { formatSeoName } from "@rbx/core-scripts/format/string";
import { useTranslation } from "@rbx/core-scripts/react";
import { Badge, Icon } from "@rbx/foundation-ui";
import {
  logCmntyEntrypointClickEvent,
  logCmntyEntrypointExposureEvent,
  mintEntrypointImpressionId,
} from "@rbx/community-telemetry";
import { Group } from "../services/groupsService";
import BaseTile from "../components/Common/BaseTile/BaseTile";
import getMembersFollowersLabel from "../utils/getMembersFollowersLabel";

const USER_PROFILE_CONTEXT = "userProfile";
const USER_PROFILE_ENTRY_POINT = "userProfile";

const groupName = (group: Group) => (
  <Fragment>
    {group.name}
    {group.hasVerifiedBadge && (
      <Icon
        name="icon-filled-verified-mono"
        className="content-system-emphasis text-align-y-center padding-left-xsmall"
        size="Small"
      />
    )}
  </Fragment>
);

const useRenderGroupItem = (groups: Group[]) => {
  const { translate } = useTranslation();

  // One impression id per community tile, shared by its exposure and click so they can be
  // stitched downstream. Exposures fire once per tile.
  const impressionIdsRef = useRef(new Map<number, string>());
  const exposedRef = useRef(new Set<number>());

  const getImpressionId = useCallback((groupId: number) => {
    let id = impressionIdsRef.current.get(groupId);
    if (!id) {
      id = mintEntrypointImpressionId();
      impressionIdsRef.current.set(groupId, id);
    }
    return id;
  }, []);

  const renderGroupItem = useCallback(
    (group: Group) => {
      const memberCount = group.memberCount ?? 0;
      const memberCountAbbreviated = truncNumber(memberCount, 1000, SuffixNames.withPlus, 1);
      const memberCountLabel = getMembersFollowersLabel(translate, {
        hasSocialModules: Boolean(group.hasSocialModules),
        count: memberCount,
        truncatedCount: memberCountAbbreviated,
        capitalize: true,
      });

      return (
        <BaseTile
          type={ThumbnailTypes.groupIcon}
          targetId={group.id}
          href={`/communities/${group.id}/${formatSeoName(group.name)}`}
          title={groupName(group)}
          titleTag={group.name}
          metadata={
            <div>
              <div>{memberCountLabel}</div>
              <div>{group.role?.name ?? ""}</div>
            </div>
          }
          thumbnailOverlay={
            group.isOwner ? (
              <Badge
                variant="OverMedia"
                label={translate("Label.Owner")}
                className="base-tile-thumbnail-owner-label"
              />
            ) : undefined
          }
        />
      );
    },
    [translate],
  );

  const onItemsImpressed = useCallback(
    (itemIndexes: number[]) => {
      itemIndexes.forEach(index => {
        const group = groups[index];
        if (!group || exposedRef.current.has(group.id)) {
          return;
        }
        exposedRef.current.add(group.id);
        logCmntyEntrypointExposureEvent({
          context: USER_PROFILE_CONTEXT,
          entryPoint: USER_PROFILE_ENTRY_POINT,
          entrypointImpressionId: getImpressionId(group.id),
          groupId: group.id,
          resultIndex: index,
        });
      });
    },
    [groups, getImpressionId],
  );

  const onItemClick = useCallback(
    (group: Group, itemIndex: number) => {
      logCmntyEntrypointClickEvent({
        context: USER_PROFILE_CONTEXT,
        entryPoint: USER_PROFILE_ENTRY_POINT,
        entrypointImpressionId: getImpressionId(group.id),
        groupId: group.id,
        resultIndex: itemIndex,
      });
    },
    [getImpressionId],
  );

  const getItemId = useCallback((group: Group) => group.id, []);

  return { renderGroupItem, getItemId, onItemsImpressed, onItemClick };
};

export default useRenderGroupItem;
