import { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { Thumbnail2d, ThumbnailTypes, ThumbnailAvatarHeadshotSize } from "@rbx/thumbnails";
import { ProfileFrameOverlay } from "./ProfileFrameOverlay";
import { ProfileFrameItem } from "./ProfileFrameItem";
import { ProfileFrame } from "../types/ProfileFrameTypes";
import { NONE_FRAME_ASSET_ID, findProfileFrame } from "../frames/profileFrameConstants";
import { PlusUpsellBanner } from "./PlusUpsellBanner";
import {
  trackProfileFrameFrameSelected,
  trackProfileFrameUpsellClicked,
} from "../frames/profileFrameTelemetry";

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

  const handleSave = (selectedFrameId?: number) => {
    onSave(selectedFrameId ?? NONE_FRAME_ASSET_ID)
      .then(saved => {
        if (saved) onClose();
      })
      .catch(() => {
        // onSave surfaces its own error toast and never rejects; keep the dialog open.
      });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={openDialog => {
        if (!openDialog) onClose();
      }}
      size="Medium"
      type="Default"
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
      isModal
    >
      {/* Responsive width: fill the viewport minus margin, but cap at the Medium max-width
          (480px, matching Figma) so the dialog actually shrinks with the screen instead of
          sitting at a fixed size. Foundation's Medium min-width (300px) is the floor — it keeps
          the two 120px footer buttons from overflowing on very small screens. */}
      <DialogContent style={{ width: "min(480px, calc(100vw - 48px))" }}>
        {/* Capped flex column so ONLY the frame grid scrolls (the header/preview stays put).
            The viewport cap lives in main.css (.profile-frame-dialog-body) because Foundation's
            DialogBody no longer accepts an inline style. Do NOT put overflow here: a second
            scroll box clips the selected tile's ring (drawn outside the tile) and shows a
            scrollbar prematurely — the grid owns its own scroll + ring padding. */}
        <DialogBody className="flex flex-col gap-large profile-frame-dialog-body">
          {/* Fixed header so the preview stays put while the grid scrolls. */}
          <div className="flex flex-col gap-large" style={{ flexShrink: 0 }}>
            <DialogTitle className="flex flex-col gap-xxsmall">
              <span className="text-heading-small content-emphasis">
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
                frameAssetId={selectedFrame?.assetId}
                className="radius-circle"
                style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
              >
                {/* Tuck the headshot a hair inside the frame ring: the frame PNG's outer
                    edge sits ~1-2px inside the canvas, so a full-bleed headshot peeks out
                    past it. Scaling only the headshot (centered) hides that without moving
                    the frame. */}
                <div
                  className="width-full height-full radius-circle overflow-hidden bg-surface-sunken-0"
                  style={{ transform: "scale(0.97)" }}
                >
                  <Thumbnail2d
                    targetId={userId}
                    type={ThumbnailTypes.avatarHeadshot}
                    size={ThumbnailAvatarHeadshotSize.size150}
                    altName={displayName ?? "Profile avatar"}
                    containerClass="width-full height-full radius-circle"
                  />
                </div>
              </ProfileFrameOverlay>
            </div>

            {/* Plus upsell (non-Plus only): preview stays enabled, but framing is a
                Plus perk, so we point the user at the Plus page instead of saving. */}
            {!hasPlus && <PlusUpsellBanner onUpsellOpen={handleUpsellOpen} />}
          </div>

          {/* Selectable frame grid + scroll region. Layout (columns, gaps, responsive
              column count, internal scroll) lives in `main.css` (`.profile-frame-grid`)
              because this component's build lacks Tailwind grid + media-variant utilities. */}
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

        <DialogFooter className="flex gap-medium justify-start">
          {hasPlus ? (
            <Button
              variant="Emphasis"
              size="Medium"
              className="width-[120px]"
              onClick={() => {
                handleSave(selectedFrameId);
              }}
              isLoading={isSaving}
            >
              {translate("Action.Save")}
            </Button>
          ) : (
            <Button
              variant="Emphasis"
              size="Medium"
              className="width-[120px]"
              onClick={handleUpsellOpen}
            >
              {translate("Action.Subscribe")}
            </Button>
          )}
          <Button
            variant="Standard"
            size="Medium"
            className="width-[120px]"
            onClick={onClose}
            isDisabled={isSaving}
          >
            {translate("Action.Cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
