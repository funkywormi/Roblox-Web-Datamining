import { Button, Chip } from "@rbx/foundation-ui";
import type { PrivateServer, PrivateServerUser } from "../types/configurePrivateServerTypes";

type ServerMembersSectionProps = {
  server: PrivateServer;
  memberAvatarUrls: Record<number, string>;
  displayPrivacyDisclaimer: boolean;
  addPlayersText: string;
  serverMembersText: string;
  noMembersText: string;
  onOpenAddPlayersDialog: () => void;
  onRemovePlayer: (player: PrivateServerUser) => Promise<void> | void;
};

const ServerMembersSection = ({
  server,
  memberAvatarUrls,
  displayPrivacyDisclaimer,
  addPlayersText,
  serverMembersText,
  noMembersText,
  onOpenAddPlayersDialog,
  onRemovePlayer,
}: ServerMembersSectionProps) => {
  const sortedMembers = server.permissions.users.toSorted((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-medium">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-title-large content-emphasis">{serverMembersText}</span>
        <Button
          id="add-players-button"
          variant="Standard"
          size="Medium"
          isDisabled={!server.active || displayPrivacyDisclaimer}
          onClick={onOpenAddPlayersDialog}
        >
          {addPlayersText}
        </Button>
      </div>

      {/* Member List */}
      <div className="flex wrap gap-small">
        {sortedMembers.length === 0 ? (
          <span className="text-body-large content-muted padding-y-small">{noMembersText}</span>
        ) : (
          sortedMembers.map(player => (
            <div key={player.id} className="relative inline-flex items-center">
              <Chip
                className="padding-left-[var(--size-1000)]"
                text={player.displayName ?? player.name}
                trailing="icon-filled-x"
                size="Large"
                isChecked={false}
                isDisabled={!server.active}
                onCheckedChange={() => {
                  onRemovePlayer(player);
                }}
              />
              {memberAvatarUrls[player.id] && (
                <img
                  src={memberAvatarUrls[player.id]}
                  alt=""
                  className="radius-circle size-600 pointer-events-none absolute bg-inverse-action-over-media"
                  aria-hidden="true"
                  style={{ left: 8, top: "50%", transform: "translateY(-50%)" }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServerMembersSection;
