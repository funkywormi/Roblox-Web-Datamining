import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import {
  ActionType,
  SduiErrorName,
  actionTypeName,
  readStringActionParam,
  type SduiActionContext,
} from "@rbx/sdui-core";

const ACTION_TYPE_NAME = actionTypeName(ActionType.OPEN_PROFILE);
const PROFILE_TYPE = {
  User: "User",
  Group: "Group",
  Community: "Community",
} as const;
const FRIENDSHIP_ORIGIN_SOURCE = {
  PlayerSearch: "PlayerSearch",
} as const;

function reportMalformedParam(ctx: SduiActionContext, message: string, propName: string): void {
  ctx.errorReporter.reportSduiError(SduiErrorName.MalformedActionParam, message, ctx.pageContext, {
    actionType: ACTION_TYPE_NAME,
    propName,
  });
}

function getValidatedProfileParams(
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
): { profileId: string; profileType: string; source: string | undefined } | undefined {
  const profileId = readStringActionParam(actionParams, "profileId", undefined);
  if (profileId === undefined || profileId.trim() === "") {
    reportMalformedParam(ctx, `Missing or invalid profileId for ${ACTION_TYPE_NAME}`, "profileId");
    return undefined;
  }

  const profileType = readStringActionParam(actionParams, "profileType", undefined);
  if (profileType === undefined) {
    reportMalformedParam(
      ctx,
      `Missing or invalid profileType for ${ACTION_TYPE_NAME}`,
      "profileType",
    );
    return undefined;
  }

  let source = readStringActionParam(actionParams, "source", undefined);
  if (
    profileType === PROFILE_TYPE.User &&
    actionParams.source !== undefined &&
    !Object.values(FRIENDSHIP_ORIGIN_SOURCE).some(validSource => validSource === source)
  ) {
    reportMalformedParam(ctx, `Invalid source for ${ACTION_TYPE_NAME}`, "source");
    source = undefined;
  }

  return { profileId, profileType, source };
}

export function openProfileResolveHref(
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
): string | undefined {
  const params = getValidatedProfileParams(actionParams, ctx);
  if (params === undefined) {
    return undefined;
  }

  const { profileId, source } = params;
  let { profileType } = params;
  if (profileType === PROFILE_TYPE.Group) {
    profileType = PROFILE_TYPE.Community;
  }

  let path: string;
  if (profileType === PROFILE_TYPE.User) {
    path = `/users/${profileId}/profile`;
  } else {
    path = `/communities/${profileId}`;
  }

  if (source !== undefined) {
    path += `?source=${encodeURIComponent(source)}`;
    if (profileType === PROFILE_TYPE.User) {
      // Profile Add Friend reads friendshipSourceType to attribute the request.
      path += `&friendshipSourceType=${encodeURIComponent(source)}`;
    }
  }

  return getAbsoluteUrl(path);
}
