import { Appeal } from "@rbx/moderation-portal";

/**
 * We should hide abuse types that are irrelevant or unintelligible to the user.
 *
 * "None" can have a special meaning in the back end, but there is no user-facing policy for "none".
 * "Invalid" means something went wrong on the back end.
 *
 * We expect all strings returned by the API to use "VIOLATION_TYPE_..." format, since the "ABUSE_TYPE_"
 * format is deprecated. We include the deprecated format for now because we are the process of migrating the back end.
 *
 * Source: https://sourcegraph.rbx.com/github.rbx.com/Roblox/service-contracts/-/blob/protos/roblox/trust_and_safety/trust_and_safety/v1/violation_type.proto.
 */
const hiddenAbuseTypes = new Set<string>(["VIOLATION_TYPE_NONE", "VIOLATION_TYPE_INVALID"]);

export const getVisibleAbuseTypes = (abuseTypeKeys: Appeal["abuse_type_keys"]) =>
  Object.entries(abuseTypeKeys).filter(([abuseType, _]) => !hiddenAbuseTypes.has(abuseType));

const getFilteredAbuseTypes = (
  abuseTypeKeys: Appeal["abuse_type_keys"],
  translate: (key: string) => string,
) => {
  const visibleAbuseTypeKeys = getVisibleAbuseTypes(abuseTypeKeys);
  return visibleAbuseTypeKeys
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(
      ([abuseType, translationKey]) => (translationKey && translate(translationKey)) || abuseType,
    );
};

export default getFilteredAbuseTypes;
