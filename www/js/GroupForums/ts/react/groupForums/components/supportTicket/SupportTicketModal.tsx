import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Checkbox,
  Dropdown,
  Menu,
  MenuItem,
  MenuLabel,
  MenuSection,
  MenuSeparator,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetRoot,
  SheetTitle,
  TextArea
} from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import { GroupExperience } from '../../../groupExperiences/types';
import {
  getSupportTicketDeviceLabel,
  SupportTicketAttachmentDraft,
  SupportTicketDevice,
  SUPPORT_TICKET_DEVICE_GROUPS
} from '../../types/supportTicket';
import { useSupportTicketScreenshots } from '../../hooks/useSupportTicketScreenshots';
import SupportTicketField from './SupportTicketField';
import SupportTicketScreenshotsField from './SupportTicketScreenshotsField';

export type SupportTicketModalProps = {
  isOpen: boolean;
  universes: GroupExperience[];
  initialDraft?: SupportTicketAttachmentDraft | null;
  prefillDetails?: string;
  onClose: () => void;
  onAdd: (draft: SupportTicketAttachmentDraft) => void;
};

const SupportTicketModal = ({
  isOpen,
  universes,
  initialDraft,
  prefillDetails,
  onClose,
  onAdd
}: SupportTicketModalProps): JSX.Element => {
  const { translate } = useTranslation();
  const defaultUniverse = universes[0];
  const hasSingleUniverse = universes.length === 1;

  const [selectedUniverseId, setSelectedUniverseId] = useState<number>(
    initialDraft?.universeId ?? defaultUniverse?.id ?? 0
  );
  const [device, setDevice] = useState<SupportTicketDevice>(
    initialDraft?.device ?? SupportTicketDevice.CurrentDevice
  );
  const [shareUserInfo, setShareUserInfo] = useState<boolean>(initialDraft?.shareUserInfo ?? false);
  const [details, setDetails] = useState<string>(initialDraft?.details ?? prefillDetails ?? '');

  const {
    screenshots,
    assetIds: screenshotAssetIds,
    isUploading: isUploadingScreenshots,
    errorKey: screenshotErrorKey,
    errorMeta: screenshotErrorMeta,
    remainingSlots: screenshotRemainingSlots,
    addFiles: addScreenshots,
    removeByKey: removeScreenshot,
    reset: resetScreenshots,
    validation: screenshotValidation
  } = useSupportTicketScreenshots(
    initialDraft?.screenshotAssetIds ?? [],
    initialDraft?.screenshotPreviewUrls ?? []
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedUniverseId(initialDraft?.universeId ?? defaultUniverse?.id ?? 0);
    setDevice(initialDraft?.device ?? SupportTicketDevice.CurrentDevice);
    setShareUserInfo(initialDraft?.shareUserInfo ?? false);
    setDetails(initialDraft?.details ?? prefillDetails ?? '');
    resetScreenshots(
      initialDraft?.screenshotAssetIds ?? [],
      initialDraft?.screenshotPreviewUrls ?? []
    );
  }, [isOpen, initialDraft, prefillDetails, defaultUniverse?.id, resetScreenshots]);

  const selectedUniverse = useMemo(
    () => universes.find(universe => universe.id === selectedUniverseId) ?? defaultUniverse,
    [universes, selectedUniverseId, defaultUniverse]
  );

  // Universe and details are required; device always has a default and consent is optional.
  // Wait for in-flight uploads to settle.
  const canAdd = !!selectedUniverse && details.trim().length > 0 && !isUploadingScreenshots;

  const whereLabel = `${translate('Label.SupportTicketWhereField')} *`;
  const deviceLabel = `${translate('Label.SupportTicketDeviceField')} *`;
  const detailsLabel = `${translate('Label.SupportTicketDetails')} *`;

  // onAdd also closes the modal
  const handleAdd = useCallback(() => {
    if (!selectedUniverse || !canAdd) {
      return;
    }

    onAdd({
      universeId: selectedUniverse.id,
      device,
      shareUserInfo,
      details,
      screenshotAssetIds,
      screenshotPreviewUrls: screenshots.map(screenshot => screenshot.previewUrl)
    });
  }, [
    canAdd,
    details,
    device,
    onAdd,
    screenshots,
    selectedUniverse,
    shareUserInfo,
    screenshotAssetIds
  ]);

  return (
    <SheetRoot open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent
        className='support-ticket-sheet-content'
        centerSheetSize='Medium'
        largeScreenVariant='center'
        onPointerDownOutside={event => {
          event.preventDefault();
          handleAdd();
        }}
        closeLabel={translate('Action.Close')}>
        <SheetTitle>
          <span className='flex items-center gap-small'>
            {translate('Heading.SupportTicketDetails')}
            <Badge
              variant='Neutral'
              label={translate('Label.Private')}
              className='support-ticket-private-badge'
              data-testid='support-ticket-private-badge'
            />
          </span>
        </SheetTitle>
        <SheetBody className='flex flex-col gap-large'>
          <SheetDescription>
            <p className='text-body-medium content-muted margin-none'>
              {translate('Label.SupportTicketDetailsSubtitle')}
            </p>
          </SheetDescription>

          <SupportTicketField label={whereLabel}>
            {hasSingleUniverse && selectedUniverse ? (
              <p
                className='text-body-medium content-emphasis'
                data-testid='support-ticket-universe-readonly'>
                {selectedUniverse.name}
              </p>
            ) : (
              <Dropdown
                data-testid='support-ticket-universe-dropdown'
                size='Medium'
                placeholder={selectedUniverse?.name ?? ''}
                value={selectedUniverseId.toString()}
                onValueChange={value => setSelectedUniverseId(Number(value))}>
                <Menu>
                  <MenuSection>
                    {universes.map(universe => (
                      <MenuItem
                        key={universe.id}
                        value={universe.id.toString()}
                        title={universe.name}
                      />
                    ))}
                  </MenuSection>
                </Menu>
              </Dropdown>
            )}
          </SupportTicketField>

          <SupportTicketField label={deviceLabel}>
            <Dropdown
              data-testid='support-ticket-device-dropdown'
              size='Medium'
              placeholder={getSupportTicketDeviceLabel(device, translate)}
              value={device}
              onValueChange={value => setDevice(value as SupportTicketDevice)}>
              <Menu>
                {SUPPORT_TICKET_DEVICE_GROUPS.map((group, index) => (
                  <React.Fragment key={group.labelKey ?? group.options[0]}>
                    {index > 0 && <MenuSeparator />}
                    {group.labelKey && (
                      <MenuLabel
                        className='support-ticket-device-group-label'
                        title={translate(group.labelKey)}
                      />
                    )}
                    <MenuSection>
                      {group.options.map(option => (
                        <MenuItem
                          key={option}
                          value={option}
                          title={getSupportTicketDeviceLabel(option, translate)}
                        />
                      ))}
                    </MenuSection>
                  </React.Fragment>
                ))}
              </Menu>
            </Dropdown>
          </SupportTicketField>

          <SupportTicketField label={detailsLabel}>
            <TextArea
              data-testid='support-ticket-details-input'
              textareaClassName='support-ticket-details-textarea'
              value={details}
              onChange={event => setDetails(event.target.value)}
              placeholder={translate('Label.SupportTicketDetailsPlaceholder')}
              rows={2}
            />
          </SupportTicketField>

          <SupportTicketScreenshotsField
            screenshots={screenshots}
            uploadedCount={screenshotAssetIds.length}
            errorKey={screenshotErrorKey}
            errorMeta={screenshotErrorMeta}
            remainingSlots={screenshotRemainingSlots}
            accept={screenshotValidation.accept}
            onAddFiles={addScreenshots}
            onRemove={removeScreenshot}
          />

          {/* `hint` renders inside the checkbox label, so the caption aligns with
              the label text and toggles the box when clicked. */}
          <Checkbox
            className='support-ticket-consent-label'
            data-testid='support-ticket-consent-checkbox'
            isChecked={shareUserInfo}
            onCheckedChange={checked => setShareUserInfo(checked === true)}
            label={translate('Label.SupportTicketShareUserInfo')}
            hint={translate('Label.SupportTicketShareUserInfoHint')}
            placement='Start'
            size='Small'
          />
        </SheetBody>
        <SheetActions className='support-ticket-sheet-actions'>
          <div className='support-ticket-footer-buttons'>
            <Button
              data-testid='support-ticket-add-button'
              variant='Emphasis'
              size='Medium'
              isDisabled={!canAdd}
              onClick={handleAdd}>
              {translate('Action.Add')}
            </Button>
            <Button variant='Standard' size='Medium' onClick={onClose}>
              {translate('Action.Cancel')}
            </Button>
          </div>
        </SheetActions>
      </SheetContent>
    </SheetRoot>
  );
};

SupportTicketModal.displayName = 'SupportTicketModal';

export default SupportTicketModal;
