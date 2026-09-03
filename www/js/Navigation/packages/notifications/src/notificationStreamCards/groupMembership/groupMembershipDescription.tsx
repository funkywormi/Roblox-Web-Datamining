import React, { ReactNode } from "react";
import { EnvironmentUrls } from "Roblox";
import { GroupMembershipMetadata, GroupMembershipNotificationData } from "./types";

const { websiteUrl } = EnvironmentUrls;

// Matches the Angular `groupLink` template (layoutLibraryI18nService.js: '/communities/{id}').
export const groupHref = (groupId: number): string => `${websiteUrl}/communities/${groupId}`;

type TranslateFunction = (resourceId: string, params?: Record<string, unknown>) => string;

// Substituted for {groupOne}/{groupTwo} so the translated string can be split and the
// placeholders swapped for <a> nodes (Angular uses ng-bind-html; this avoids dangerouslySetInnerHTML).
const GROUP_TOKENS = ["%%G0%%", "%%G1%%"];
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TOKEN_SPLIT = new RegExp(`(${GROUP_TOKENS.map(escapeRegExp).join("|")})`);

const GroupLink = ({ group }: { group: GroupMembershipMetadata }): JSX.Element => (
  // stopPropagation: the group link navigates on its own; must not fire the whole-card click.
  <a
    href={groupHref(group.AccepterGroupId)}
    className="content-link"
    style={{ fontWeight: 600 }}
    onClick={e => e.stopPropagation()}
  >
    {group.AccepterGroupName}
  </a>
);

// Key selection + counts must stay in parity with groupMembershipDirective.js `textFormat`.
export const buildGroupMembershipDescription = (
  translate: TranslateFunction,
  data: GroupMembershipNotificationData,
): ReactNode => {
  const groups = data.metadataCollection ?? [];
  const { length } = groups;
  const count = data.eventCount || length;

  if (length === 0) {
    return translate("Message.YouHaveBeenAcceptedToNewGroups", { numberOfGroups: count });
  }

  const linked = groups.slice(0, 2);
  const params: Record<string, unknown> = { groupOne: GROUP_TOKENS[0] };
  let key: string;

  if (count > 2 || count > length) {
    key = "Message.GroupJoinRequestAcceptedMultiple";
    params.groupTwo = GROUP_TOKENS[1];
    params.groupMultipleCount = length > 2 ? count - 2 : count - length;
  } else if (count === 2) {
    key = "Message.GroupJoinRequestAcceptedDouble";
    params.groupTwo = GROUP_TOKENS[1];
  } else {
    key = "Message.GroupJoinRequestAcceptedSingle";
  }

  const text = translate(key, params);

  return (
    <React.Fragment>
      {text.split(TOKEN_SPLIT).map((part, index) => {
        const tokenIndex = GROUP_TOKENS.indexOf(part);
        if (tokenIndex >= 0) {
          const group = linked[tokenIndex];
          // Angular leaves an absent group as an empty substitution; never surface the raw token.
          // eslint-disable-next-line react/no-array-index-key
          return group ? <GroupLink key={`g${index}`} group={group} /> : null;
        }
        // eslint-disable-next-line react/no-array-index-key
        return <React.Fragment key={`t${index}`}>{part}</React.Fragment>;
      })}
    </React.Fragment>
  );
};
