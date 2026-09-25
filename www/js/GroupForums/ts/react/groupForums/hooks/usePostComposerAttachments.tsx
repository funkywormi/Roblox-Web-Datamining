import React, { useState } from 'react';
import { useTranslation } from 'react-utilities';
import PostComposerAttachmentMenu, {
  AttachmentMenuItem
} from '../components/content/PostComposerAttachmentMenu';
import SupportTicketAttachmentPill from '../components/supportTicket/SupportTicketAttachmentPill';
import SupportTicketModal from '../components/supportTicket/SupportTicketModal';
import EducationalTooltip from '../../shared/components/EducationalTooltip';
import useSupportTicketAttachEligibility from './useSupportTicketAttachEligibility';
import {
  SupportTicketAttachmentDraft,
  SUPPORT_TICKET_ICON_REGULAR_BUG
} from '../types/supportTicket';
import { ForumCategory } from '../types';
import useForumImageAttachments from './useForumImageAttachments';

const SUPPORT_TICKET_EDUCATION_TOOLTIP_KEY =
  'Roblox.Groups.ForumsSupportTicketEducationalTooltipDismissed';

type UsePostComposerAttachmentsParams = {
  groupId: number;
  activeCategory?: ForumCategory;
  canCreatePostInActiveCategory: boolean;
  isEditing: boolean;
  // Read at open time to seed the (first) bug report's details from the in-progress post.
  getPrefillDetails?: () => string;
};

type UsePostComposerAttachmentsResult = {
  // The attached draft, if any, so the composer can include it in the create-post request.
  supportTicketAttachment: SupportTicketAttachmentDraft | null;
  // Ordered, completed image assets for the create-post request.
  mediaAssetIds: number[];
  // Publishing is blocked until every selected image has uploaded successfully.
  isImageUploadBlockingSubmit: boolean;
  // Rendered into the editor's leadingControls slot (the (+) menu, optionally with education).
  leadingControl: React.ReactNode;
  // Rendered into the editor's footer slot below the editable text.
  contentFooter: React.ReactNode;
  // The attachment modal; the composer just places it in its tree.
  modal: React.ReactNode;
  // The hidden file input used by the image attachment menu item.
  input: React.ReactNode;
};

// Owns the post composer's attachment surface: eligibility, the (+) menu, image previews,
// the support-ticket chip, and its details modal.
const usePostComposerAttachments = ({
  groupId,
  activeCategory,
  canCreatePostInActiveCategory,
  isEditing,
  getPrefillDetails
}: UsePostComposerAttachmentsParams): UsePostComposerAttachmentsResult => {
  const { translate } = useTranslation();
  const [
    supportTicketAttachment,
    setSupportTicketAttachment
  ] = useState<SupportTicketAttachmentDraft | null>(null);
  const [isSupportTicketModalOpen, setIsSupportTicketModalOpen] = useState(false);
  const [prefillDetails, setPrefillDetails] = useState('');

  const {
    isAttachmentsFeatureEnabled,
    isSupportTicketOptionDisabled,
    hasLinkedUniverse,
    universes
  } = useSupportTicketAttachEligibility(activeCategory?.shortId ?? '');

  const {
    mediaAssetIds,
    isSubmitBlocked: isImageUploadBlockingSubmit,
    menuItem: imageMenuItem,
    contentFooter: imageUploadPreviews,
    input: imageInput
  } = useForumImageAttachments({
    groupId,
    activeCategory,
    canCreateInActiveCategory: canCreatePostInActiveCategory,
    isEditing
  });

  // Snapshot the in-progress post into the details field only when starting a fresh report; editing
  // an existing attachment keeps the draft the author already saved.
  const openSupportTicketModal = () => {
    if (!supportTicketAttachment) {
      setPrefillDetails(getPrefillDetails?.() ?? '');
    }
    setIsSupportTicketModalOpen(true);
  };

  // Bug-report attachment is offered only for new posts, with the feature on, in a community that
  // has at least one linked universe. The (+) renders only once that's resolved, so it never
  // flashes in/out during the (cached) universe lookup.
  const canAttachSupportTicket = !isEditing && isAttachmentsFeatureEnabled && hasLinkedUniverse;

  // Entries for the composer's (+) menu; the menu renders when at least one is available.
  const attachmentItems: AttachmentMenuItem[] = [];
  if (canAttachSupportTicket) {
    attachmentItems.push({
      id: 'support-ticket',
      label: translate('Label.SupportTicketMenuOption'),
      icon: SUPPORT_TICKET_ICON_REGULAR_BUG,
      disabled: isSupportTicketOptionDisabled,
      onSelect: openSupportTicketModal
    });
  }
  if (imageMenuItem) {
    attachmentItems.push(imageMenuItem);
  }

  // Renders inline before the editor's "Aa" toggle via the rich-text leadingControls slot.
  const attachmentMenu =
    attachmentItems.length > 0 ? <PostComposerAttachmentMenu items={attachmentItems} /> : null;

  // Educate only when the bug-report option is usable (enabled). The education is bug-report-
  // specific, so revisit this gating when a second attachment type lands.
  const leadingControl =
    attachmentMenu && canAttachSupportTicket && !isSupportTicketOptionDisabled ? (
      <EducationalTooltip
        title={translate('Heading.SupportTicketEducationTitle')}
        description={translate('Label.SupportTicketEducationDescription')}
        localStorageKey={SUPPORT_TICKET_EDUCATION_TOOLTIP_KEY}
        beakLeftOffset={16}>
        {attachmentMenu}
      </EducationalTooltip>
    ) : (
      attachmentMenu
    );

  // Once attached, the chip renders as a flow block below the text and above the (+)/"Aa" row via
  // the rich-text footer slot.
  const supportTicketPill =
    canAttachSupportTicket && supportTicketAttachment ? (
      <SupportTicketAttachmentPill
        onEdit={openSupportTicketModal}
        onRemove={() => setSupportTicketAttachment(null)}
      />
    ) : null;

  const contentFooter =
    imageUploadPreviews || supportTicketPill ? (
      <React.Fragment>
        {imageUploadPreviews}
        {supportTicketPill}
      </React.Fragment>
    ) : null;

  const modal = canAttachSupportTicket ? (
    <SupportTicketModal
      isOpen={isSupportTicketModalOpen}
      universes={universes}
      initialDraft={supportTicketAttachment}
      prefillDetails={prefillDetails}
      onClose={() => setIsSupportTicketModalOpen(false)}
      onAdd={draft => {
        setSupportTicketAttachment(draft);
        setIsSupportTicketModalOpen(false);
      }}
    />
  ) : null;

  return {
    supportTicketAttachment,
    mediaAssetIds,
    isImageUploadBlockingSubmit,
    leadingControl,
    contentFooter,
    modal,
    input: imageInput
  };
};

export default usePostComposerAttachments;
