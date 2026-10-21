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

function reportMalformedParam(ctx: SduiActionContext, message: string, propName: string): void {
  ctx.errorReporter.reportSduiError(SduiErrorName.MalformedActionParam, message, ctx.pageContext, {
    actionType: ACTION_TYPE_NAME,
    propName,
  });
}

function getValidatedProfileParams(
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
): { profileId: string; profileType: string } | undefined {
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

  return { profileId, profileType };
}

export function openProfileResolveHref(
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
): string | undefined {
  const params = getValidatedProfileParams(actionParams, ctx);
  if (params === undefined) {
    return undefined;
  }

  const { profileId } = params;
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

  const source = readStringActionParam(actionParams, "source", undefined);
  if (source !== undefined) {
    path += `?source=${encodeURIComponent(source)}`;
  }

  return getAbsoluteUrl(path);
}
