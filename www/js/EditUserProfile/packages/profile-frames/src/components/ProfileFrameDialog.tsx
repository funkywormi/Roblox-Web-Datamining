import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Icon,
} from "@rbx/foundation-ui";
import { Thumbnail2d, ThumbnailTypes, ThumbnailAvatarHeadshotSize } from "@rbx/thumbnails";

import { ProfileFrameItem } from "./ProfileFrameItem";
import { ProfileFrameOverlay } from "./ProfileFrameOverlay";
import { NONE_FRAME_ASSET_ID, findProfileFrame } from "../profileFrameConstants";
import { PlusUpsellBanner } from "./PlusUpsellBanner";
import {
  trackProfileFrameFrameSelected,
  trackProfileFrameUpsellClicked,
} from "../profileFrameTelemetry";

import type { ProfileFrame } from "../types";

/** Responsive preview diameter: 160px on desktop, shrinking with the smaller of the
 * viewport's width/height on small or short screens (floored so it never gets tiny). */
const PREVIEW_SIZE = "max(80px, min(160px, 32vw, 26vh))";

type ProfileFrameDialogProps = {
  open: boolean;
  onClose: () => void;
  userId: number;
  displayName?: string;
  frames: ProfileFrame[];
  equippedFrameId?: number;
  isSaving: boolean;
  onSave: (assetId: number) => Promise<boolean>;
  onUpsellOpen: () => void;
  hasPlus: boolean;
};

/**
 * Chooser dialog for the web edit-frame experience: a live avatar preview, a grid of
 * selectable frames, and Save/Cancel. Selection is local until Save is pressed.
 *
 * Non-Plus users get a preview-only experience: they can select frames to see them
 * on their avatar, but the primary button is "Subscribe" (redirects to Plus) and an
 * upsell banner is shown above the grid.
 */
export const ProfileFrameDialog = ({
  open,
  onClose,
  userId,
  displayName,
  frames,
  equippedFrameId,
  isSaving,
  onSave,
  hasPlus,
  onUpsellOpen,
}: ProfileFrameDialogProps) => {
  const { translate } = useTranslation();
  const [selectedFrameId, setSelectedFrameId] = useState(equippedFrameId);

  // Seed the local selection from the equipped frame while the dialog is open, until the
  // user makes a choice. This covers opening the dialog before the equipped-frame query
  // resolves, while ensuring a late-resolving query can't clobber a live user selection
  // (guarded by hasUserSelected, reset when the dialog closes).
  const hasUserSelected = useRef(false);
  useEffect(() => {
    if (!open) {
      hasUserSelected.current = false;
      return;
    }
    if (!hasUserSelected.current) {
      setSelectedFrameId(equippedFrameId);
    }
  }, [open, equippedFrameId]);

  const selectedFrame = findProfileFrame(frames, selectedFrameId);

  const handleSelect = (frameId: number) => {
    hasUserSelected.current = true;
    const nextFrameId = selectedFrameId === frameId ? NONE_FRAME_ASSET_ID : frameId;
    setSelectedFrameId(nextFrameId);
    trackProfileFrameFrameSelected({
      userId,
      frameId: String(nextFrameId),
      hasPlus,
    });
  };

  const handleUpsellOpen = () => {
    trackProfileFrameUpsellClicked({
      userId,
      frameId: String(selectedFrameId ?? NONE_FRAME_ASSET_ID),
      hasPlus,
    });
    onUpsellOpen();
  };

  const handleSave = (frameIdToSave?: number) => {
    onSave(frameIdToSave ?? NONE_FRAME_ASSET_ID)
      .then(saved => {
        if (saved) onClose();
      })
      .catch(() => {
        // onSave surfaces its own error toast and never rejects; keep the dialog open.
      });
  };

  return (
    <Dialog
      closeLabel={translate("Action.Close")}
      hasCloseAffordance
      isModal
      open={open}
      size="Medium"
      type="Default"
      onOpenChange={openDialog => {
        if (!openDialog) onClose();
      }}
    >
      {/* Responsive width: fill the viewport minus margin, but cap at the Medium max-width
          (480px) so the dialog actually shrinks with the screen instead of
          sitting at a fixed size. Foundation's Medium min-width (300px) is the floor — it keeps
          the two 120px footer buttons from overflowing on very small screens. */}
      <DialogContent style={{ width: "min(480px, calc(100vw - 48px))" }}>
        {/* Capped flex column so ONLY the frame grid scrolls (the header/preview stays put).
            The viewport cap lives in profileFrames.css (.profile-frame-dialog-body) because
            Foundation's DialogBody no longer accepts an inline style. Do NOT put overflow here:
            a second scroll box clips the selected tile's ring (drawn outside the tile) and shows
            a scrollbar prematurely — the grid owns its own scroll + ring padding. */}
        <DialogBody className="gap-large profile-frame-dialog-body flex flex-col">
          {/* Fixed header so the preview stays put while the grid scrolls. */}
          <div className="gap-large flex flex-col" style={{ flexShrink: 0 }}>
            <DialogTitle className="gap-xxsmall flex flex-col">
              <span className="gap-xsmall content-emphasis text-heading-small flex items-center">
                <Icon aria-hidden name="icon-regular-roblox-plus" size="Medium" />
                {translate("Heading.ProfileFrame")}
              </span>
              <span className="text-body-medium content-default">
                {translate("Description.ProfileFrameUpsell")}
              </span>
            </DialogTitle>

            {/* Live preview of the selected frame on the user's headshot. Sized off the
                viewport (width and height) so it shrinks on small/short screens instead of
                dominating the dialog, capped at the 160px design size on desktop. */}
            <div className="flex justify-center" style={{ paddingTop: 16, paddingBottom: 16 }}>
              <ProfileFrameOverlay
                className="radius-circle"
                frameAssetId={selectedFrame?.assetId}
                style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
              >
                <div className="width-full height-full radius-circle bg-surface-sunken-0 overflow-hidden">
                  <Thumbnail2d
                    altName={displayName ?? "Profile avatar"}
                    containerClass="width-full height-full radius-circle"
                    size={ThumbnailAvatarHeadshotSize.size150}
                    targetId={userId}
                    type={ThumbnailTypes.avatarHeadshot}
                  />
                </div>
              </ProfileFrameOverlay>
            </div>

            {/* Plus upsell (non-Plus only): preview stays enabled, but framing is a
                Plus perk, so we point the user at the Plus page instead of saving. */}
            {!hasPlus && <PlusUpsellBanner onUpsellOpen={handleUpsellOpen} />}
          </div>

          {/* Selectable frame grid + scroll region. Layout (columns, gaps, responsive
              column count, internal scroll) lives in `profileFrames.css`
              (`.profile-frame-grid`) because this component's build lacks Tailwind grid +
              media-variant utilities. */}
          <div className="profile-frame-grid">
            {frames.map(frame => (
              <ProfileFrameItem
                key={frame.assetId}
                frame={frame}
                isSelected={frame.assetId === selectedFrameId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </DialogBody>

        <DialogFooter className="gap-medium flex justify-start">
          {hasPlus ? (
            <Button
              className="width-[120px]"
              isLoading={isSaving}
              size="Medium"
              variant="Emphasis"
              onClick={() => {
                handleSave(selectedFrameId);
              }}
            >
              {translate("Action.Save")}
            </Button>
          ) : (
            <Button
              className="width-[120px]"
              size="Medium"
              variant="Emphasis"
              onClick={handleUpsellOpen}
            >
              {translate("Action.Subscribe")}
            </Button>
          )}
          <Button
            className="width-[120px]"
            isDisabled={isSaving}
            size="Medium"
            variant="Standard"
            onClick={onClose}
          >
            {translate("Action.Cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
