import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import { UrlConfig } from "@rbx/core-scripts/http";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { ProfileFrame } from "../types/ProfileFrameTypes";

/**
 * Backend API for the profile frame edit experience.
 *
 * List (the frames a user can equip):
 *   - marketplace-widgets: GET /marketplace-widgets/v1/widgets?context=catalog-tab:profile-frames
 *     returns widgets whose content is a list of frame Assets, then
 *   - POST /marketplace-widgets/v1/widgets/hydrate resolves each asset's name.
 *   Each frame's preview image is rendered client-side from its asset id via the
 *   thumbnails service (the hydrate response carries no thumbnail).
 *
 * Read / equip (the user's own frame) rides on the consolidated avatar-v4
 * endpoints already used for backgrounds:
 *   - read equipped: GET  /v4/avatar/users/{userId}?selectionTypes=ProfileFrame
 *   - equip / clear: PATCH /v4/avatar  (updateTypes: ["UpdateProfileFrame"])
 */

const UPDATE_AVATAR_URL = `${environmentUrls.avatarApi}/v4/avatar`;

const WIDGETS_URL = `${environmentUrls.apiGatewayUrl}/marketplace-widgets/v1/widgets`;
const HYDRATE_URL = `${WIDGETS_URL}/hydrate`;
const PROFILE_FRAMES_CONTEXT = "catalog-tab:profile-frames";
const ASSET_CONTENT_TYPE = "Asset";
const DEFAULT_FRAME_NAME = "Frame";

const getUserAvatarUrl = (userId: number): string =>
  `${environmentUrls.avatarApi}/v4/avatar/users/${userId}?selectionTypes=ProfileFrame`;

/** Sentinel id sent to the equip endpoint to remove the current frame. */
export const NO_PROFILE_FRAME_ASSET_ID = 0;

/**
 * Equipped profile frame in the v4 GET response. Confirmed shape:
 *   "profileFrame": { "frameAsset": { "id": 74115484630951 } }
 * Other plausible nestings (the flat avatar-json `avatarProfileFrame.frameAssetId`,
 * or a wrap under `avatarConfigurations`) are tolerated defensively; the first
 * positive id found wins.
 */
type ProfileFrameNode =
  | { frameAsset?: { id?: number } | null; frameAssetId?: number }
  | null
  | undefined;

type GetEquippedProfileFrameResponse = {
  profileFrame?: ProfileFrameNode;
  avatarProfileFrame?: ProfileFrameNode;
  avatarConfigurations?: { profileFrame?: ProfileFrameNode } | null;
};

const readEquippedAssetId = (data: GetEquippedProfileFrameResponse): number | null => {
  const node =
    data.profileFrame ?? data.avatarProfileFrame ?? data.avatarConfigurations?.profileFrame;
  const id = node?.frameAsset?.id ?? node?.frameAssetId;
  return typeof id === "number" && id > 0 ? id : null;
};

export async function fetchEquippedProfileFrameId(): Promise<number | null> {
  const currentUserId = authenticatedUser()?.id;
  if (!currentUserId) {
    return null;
  }

  const urlConfig: UrlConfig = {
    url: getUserAvatarUrl(currentUserId),
    withCredentials: true,
  };

  const response = await http.get<GetEquippedProfileFrameResponse>(urlConfig);
  return readEquippedAssetId(response.data);
}

/**
 * Pass `NO_PROFILE_FRAME_ASSET_ID` to remove the current frame. The endpoint operates
 * on the authenticated user, so no id is sent in the path.
 */
export async function equipProfileFrame(frameAssetId: number): Promise<void> {
  const urlConfig: UrlConfig = {
    url: UPDATE_AVATAR_URL,
    withCredentials: true,
  };

  const body = {
    updateTypes: ["UpdateProfileFrame"],
    avatarDefinition: {
      updateAvatarConfig: {
        profileFrameRequestModel: { id: frameAssetId },
      },
    },
  };

  await http.patch<unknown>(urlConfig, body);
}

type WidgetContentItem = { id?: number; type?: string };
type Widget = { content?: WidgetContentItem[] };
type GetWidgetsResponse = { widgets?: Record<string, Widget | null> };

type HydratedAsset = { id?: number; name?: string };
type HydrateContentResponse = { hydratedContent?: HydratedAsset[] };

/** A tracing id the widget endpoint requires; value is not otherwise meaningful. */
const newRequestId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const buildWidgetsUrl = (): string => {
  const params = new URLSearchParams({
    requestId: newRequestId(),
    context: PROFILE_FRAMES_CONTEXT,
  });
  return `${WIDGETS_URL}?${params.toString()}`;
};

async function fetchProfileFrameAssetIds(): Promise<number[]> {
  const urlConfig: UrlConfig = { url: buildWidgetsUrl(), withCredentials: true };
  const response = await http.get<GetWidgetsResponse>(urlConfig);

  const assetIds: number[] = [];
  const seen = new Set<number>();
  Object.values(response.data.widgets ?? {}).forEach(widget => {
    (widget?.content ?? []).forEach(item => {
      if (item.type === ASSET_CONTENT_TYPE && typeof item.id === "number" && !seen.has(item.id)) {
        seen.add(item.id);
        assetIds.push(item.id);
      }
    });
  });
  return assetIds;
}

/**
 * Names are non-critical, so a failure resolves to an empty map and the caller falls
 * back to a generic label.
 */
async function fetchProfileFrameNames(assetIds: number[]): Promise<Map<number, string>> {
  const namesById = new Map<number, string>();
  if (assetIds.length === 0) {
    return namesById;
  }

  const urlConfig: UrlConfig = { url: HYDRATE_URL, withCredentials: true };
  const body = { content: assetIds.map(id => ({ id, type: ASSET_CONTENT_TYPE })) };

  try {
    const response = await http.post<HydrateContentResponse>(urlConfig, body);
    (response.data.hydratedContent ?? []).forEach(item => {
      if (typeof item.id === "number" && item.name) {
        namesById.set(item.id, item.name);
      }
    });
  } catch {
    // Names are cosmetic; leave the map empty and let the caller use the fallback.
  }
  return namesById;
}

/**
 * Equippable frames only — no "None" entry, since the grid represents "no frame" as an
 * empty selection rather than a tile. Returns `[]` when the widget serves no frames.
 */
export async function fetchAvailableProfileFrames(): Promise<ProfileFrame[]> {
  const assetIds = await fetchProfileFrameAssetIds();
  const namesById = await fetchProfileFrameNames(assetIds);
  return assetIds.map(assetId => ({
    name: namesById.get(assetId) ?? DEFAULT_FRAME_NAME,
    assetId,
  }));
}
