import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  List,
  ListItem,
  TextInput,
} from "@rbx/foundation-ui";
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import { CanInviteResponseEnum } from "../../constants/canInviteResponseEnum";
import { configurePrivateServerConstants } from "../../constants/configurePrivateServerConstants";
import { configurePrivateServerService } from "../../services/configurePrivateServerService";
import type { PrivateServerUser } from "../../types/configurePrivateServerTypes";

type AddPlayersDialogProps = {
  open: boolean;
  serverMembers: PrivateServerUser[];
  addActionText: string;
  cancelActionText: string;
  title: string;
  searchLabel: string;
  addAtLeastOneText: string;
  userAlreadyInvitedText: string;
  unableToAddAnyUsersText: string;
  unableToAddNonFriendsText: string;
  unableToAddSpecificUserText: string;
  maxPlayersText: (maxPlayers: number) => string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (players: PrivateServerUser[]) => Promise<void>;
};

const AddPlayersDialog = ({
  open,
  serverMembers,
  addActionText,
  cancelActionText,
  title,
  searchLabel,
  addAtLeastOneText,
  userAlreadyInvitedText,
  unableToAddAnyUsersText,
  unableToAddNonFriendsText,
  unableToAddSpecificUserText,
  maxPlayersText,
  onOpenChange,
  onSubmit,
}: AddPlayersDialogProps) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PrivateServerUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<PrivateServerUser[]>([]);
  const [avatarUrls, setAvatarUrls] = useState<Record<number, string>>({});
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSearchResults([]);
      setSelectedUsers([]);
      setAvatarUrls({});
      setErrorMessage("");
      setIsLoadingUser(false);
      return;
    }
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      configurePrivateServerService
        .searchUsers(query)
        .then(response => {
          setSearchResults(response.data);
        })
        .catch(() => {
          setSearchResults([]);
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, query]);

  const selectedUserIds = useMemo(
    () => new Set(selectedUsers.map(user => user.id)),
    [selectedUsers],
  );
  const memberIds = useMemo(() => new Set(serverMembers.map(user => user.id)), [serverMembers]);
  const visibleUserIds = useMemo(
    () => [...new Set([...searchResults, ...selectedUsers].map(user => user.id))],
    [searchResults, selectedUsers],
  );

  useEffect(() => {
    if (!open || visibleUserIds.length === 0) {
      return;
    }
    let isMounted = true;
    configurePrivateServerService
      .getUserHeadshots(visibleUserIds)
      .then(urls => {
        if (!isMounted) {
          return;
        }
        setAvatarUrls(prev => ({
          ...prev,
          ...urls,
        }));
      })
      .catch(() => {
        // no-op
      });

    return () => {
      isMounted = false;
    };
  }, [open, visibleUserIds]);

  const selectUser = async (user: PrivateServerUser) => {
    setErrorMessage("");

    if (
      String(CurrentUser?.userId) === String(user.id) ||
      memberIds.has(user.id) ||
      selectedUserIds.has(user.id)
    ) {
      setErrorMessage(userAlreadyInvitedText);
      return;
    }

    if (serverMembers.length + selectedUsers.length >= configurePrivateServerConstants.maxPlayers) {
      setErrorMessage(maxPlayersText(configurePrivateServerConstants.maxPlayers));
      return;
    }

    setIsLoadingUser(true);
    try {
      const response = await configurePrivateServerService.canInviteUser(user.id);
      switch (response.inviteResponseType) {
        case CanInviteResponseEnum.CanInvite:
          setSelectedUsers(prev => [...prev, user]);
          break;
        case CanInviteResponseEnum.UnableToAddAnyUser:
          setErrorMessage(unableToAddAnyUsersText);
          break;
        case CanInviteResponseEnum.UnableToAddNonFriends:
          setErrorMessage(unableToAddNonFriendsText);
          break;
        case CanInviteResponseEnum.Invalid:
        case CanInviteResponseEnum.UnableToAddSpecificUser:
          setErrorMessage(unableToAddSpecificUserText);
          break;
      }
    } catch {
      setErrorMessage(unableToAddSpecificUserText);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const removeUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      setErrorMessage(addAtLeastOneText);
      return;
    }
    await onSubmit(selectedUsers);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="Medium"
      type="Default"
      hasCloseAffordance={false}
      isModal
    >
      <DialogContent className="!min-width-[280px] width-full">
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle className="text-heading-small">{title}</DialogTitle>

          {/* Search Input */}
          <TextInput
            value={query}
            onChange={event => {
              setQuery(event.target.value);
            }}
            placeholder={searchLabel}
            hasError={Boolean(errorMessage)}
          />

          {/* Search Results */}
          {Boolean(query.trim()) && searchResults.length > 0 && (
            <div
              className="radius-medium stroke-standard stroke-default scroll-y"
              style={{ maxHeight: 180 }}
            >
              <List>
                {searchResults.map(user => (
                  <ListItem
                    key={user.id}
                    isContained
                    size="Medium"
                    divider="Inset"
                    title={user.displayName ?? user.name}
                    leading={
                      avatarUrls[user.id] ? (
                        <img
                          src={avatarUrls[user.id]}
                          alt=""
                          className="radius-circle size-600 bg-inverse-action-over-media"
                          aria-hidden="true"
                        />
                      ) : undefined
                    }
                    onSelect={() => {
                      selectUser(user);
                    }}
                  />
                ))}
              </List>
            </div>
          )}

          {/* Selected Users */}
          {(selectedUsers.length > 0 || isLoadingUser) && (
            <div className="flex wrap gap-small scroll-y" style={{ maxHeight: 220 }}>
              {selectedUsers.map(user => (
                <div key={user.id} className="relative inline-flex items-center">
                  <Chip
                    className="padding-left-[var(--size-1000)]"
                    text={user.displayName ?? user.name}
                    trailing="icon-filled-x"
                    size="Large"
                    isChecked={false}
                    onCheckedChange={() => {
                      removeUser(user.id);
                    }}
                  />
                  {avatarUrls[user.id] && (
                    <img
                      src={avatarUrls[user.id]}
                      alt=""
                      className="radius-circle size-600 pointer-events-none absolute bg-inverse-action-over-media"
                      aria-hidden="true"
                      style={{ left: 8, top: "50%", transform: "translateY(-50%)" }}
                    />
                  )}
                </div>
              ))}
              {isLoadingUser && <span className="spinner spinner-sm" />}
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <span aria-live="assertive" className="text-caption-body content-system-alert">
              {errorMessage}
            </span>
          )}
        </DialogBody>
        <DialogFooter className="flex flex-col gap-small small:flex-row">
          <Button
            variant="Emphasis"
            size="Medium"
            className="fill small:basis-0"
            onClick={() => {
              handleSubmit();
            }}
          >
            {addActionText}
          </Button>
          <Button
            variant="Standard"
            size="Medium"
            className="fill small:basis-0"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {cancelActionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlayersDialog;
