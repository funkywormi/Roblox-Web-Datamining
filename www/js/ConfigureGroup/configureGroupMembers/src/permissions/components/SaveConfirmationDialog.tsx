import type { FunctionComponent } from 'react';
import React, { useId, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Icon,
} from '@rbx/foundation-ui';
import { usePermissionsTranslation } from '../providers/TranslationProvider';

export type SaveConfirmationDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  grantedList: string[];
  revokedList: string[];
};

const PermissionList: FunctionComponent<{
  permissions: string[];
  translate: (key: string) => React.ReactNode;
}> = ({ permissions, translate }) => (
  // `14lh` = exactly 14 line-heights, so 14 single-line rows show with no partial row peeking
  // (a wrapped long label can still be cut mid-item). `text-body-medium` on the ul makes its
  // line-height match the rows. `list-style-position:inside` + padding-left-small (8px) places
  // the bullet ~1 character in, lining it up with the summary text above.
  // `[list-style-type:disc]` is needed because Tailwind's reset strips list markers.
  // The `::-webkit-scrollbar` styles force an always-visible styled scrollbar (overlay
  // scrollbars auto-hide on macOS, so overflow wasn't obvious) — the thumb's border matches
  // the dialog surface so it reads as inset padding.
  <ul className='text-body-medium [list-style-type:disc] [list-style-position:inside] padding-left-small margin-none [max-height:14lh] scroll-y [&::-webkit-scrollbar]:width-[12px] [&::-webkit-scrollbar]:bg-[transparent] [&::-webkit-scrollbar-thumb]:bg-[var(--color-shift-300)] [&::-webkit-scrollbar-thumb]:[border:3px_solid_var(--color-surface-100)] [&::-webkit-scrollbar-thumb]:radius-[10px]'>
    {permissions.map((permission) => (
      <li key={permission} className='text-body-medium content-default'>
        {translate(`${permission}.Label`)}
      </li>
    ))}
  </ul>
);

const SaveConfirmationDialog: FunctionComponent<SaveConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  grantedList,
  revokedList,
}) => {
  const { translate } = usePermissionsTranslation();

  const [isAcknowledged, setIsAcknowledged] = useState(false);
  // Reset the acknowledgement each time the dialog is (re)opened.
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setIsAcknowledged(false);
    }
  }

  const grantWarning = translate('SaveConfirmation.GrantWarningV2');
  const acknowledgeLabel = translate('Action.AcknowledgeMemberPermissions');
  const acknowledgeLabelId = useId();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
      isModal
      size='Large'
      hasCloseAffordance={false}>
      <DialogContent data-testid='save-confirmation-dialog'>
        <DialogBody className='flex flex-col gap-medium'>
          <div className='flex items-center gap-small'>
            <Icon
              name='icon-filled-triangle-exclamation'
              size='Large'
              className='content-system-warning'
              aria-hidden
            />
            <DialogTitle className='text-heading-small margin-none'>
              {translate('SaveConfirmation.Title')}
            </DialogTitle>
          </div>
          <div className='text-body-medium content-default'>{grantWarning}</div>
          {grantedList?.length ? (
            <PermissionList permissions={grantedList} translate={translate} />
          ) : null}
          {revokedList?.length ? (
            <div className='flex flex-col gap-x-small'>
              <div className='text-body-medium content-default'>
                {translate('SaveConfirmation.RevokeSummary')}
              </div>
              <PermissionList permissions={revokedList} translate={translate} />
            </div>
          ) : null}
          {/* Custom label (not Checkbox's built-in `label`) so the text uses body-medium weight
              per the design instead of the component's default title (bold) typography. The
              wrapping <label> keeps click-to-toggle; aria-labelledby wires the accessible name. */}
          <label className='flex items-start gap-medium self-stretch'>
            <Checkbox
              size='Medium'
              placement='Start'
              isChecked={isAcknowledged}
              isDisabled={false}
              onCheckedChange={(checked) => setIsAcknowledged(checked === true)}
              aria-labelledby={acknowledgeLabelId}
              data-testid='save-confirmation-acknowledge-checkbox'
            />
            <span
              id={acknowledgeLabelId}
              className='text-body-medium content-emphasis self-stretch'>
              {acknowledgeLabel}
            </span>
          </label>
        </DialogBody>
        <DialogFooter className='flex gap-x-small'>
          <Button
            variant='Emphasis'
            size='Medium'
            isDisabled={!isAcknowledged}
            onClick={onConfirm}
            data-testid='save-confirmation-save-button'>
            {/* Reuses the already-registered Feature.GroupManagement `Action.Continue` string
                (resolves via the provider's bare-key fallback), so no new key is needed. */}
            {translate('Action.Continue')}
          </Button>
          <Button
            variant='Standard'
            size='Medium'
            onClick={onCancel}
            data-testid='save-confirmation-cancel-button'>
            {translate('SaveConfirmation.Action.Cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { SaveConfirmationDialog };
