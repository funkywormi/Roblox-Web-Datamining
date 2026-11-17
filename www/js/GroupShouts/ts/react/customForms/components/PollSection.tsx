import React, { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Icon
} from '@rbx/foundation-ui';
import { PollBuilderForm, PollDisplay } from '@rbx/custom-forms';
import type { CreateFormRequest, CustomForm } from '@rbx/custom-forms';
import type { WithTranslationsProps } from 'react-utilities';
import classNames from 'classnames';

import useCreatePoll from '../hooks/useCreatePoll';
import customFormsService from '../services/customFormsService';
import { extractServerErrors } from '../utils/errorUtils';
import queryKeys from '../utils/queryKeys';
import AttachmentCard from '../../shared/components/AttachmentCard';
import MetricsElement from '../../shared/components/MetricsElement';
import CommunityEventStream from '../../shared/utils/eventStream';
import {
  getPollCreateShownEvent,
  getPollCreationButtonClickEvent
} from '../../shared/userActivity/pollEventStream';

export type PollSectionProps = {
  groupId: number;
  vertical: string;
  onPollCreated: (formId: number) => void;
  onPollRemoved: () => void;
  translate: WithTranslationsProps['translate'];
  existingFormId?: number;
  isReadOnly?: boolean;
  /**
   * Wraps the poll card (e.g. in a section with its own heading). Only called when there is a card
   * to show, so the wrapper never renders empty around a read-only section with no poll.
   */
  renderContainer?: (card: React.ReactNode) => React.ReactNode;
};

const renderBody = (body: React.ReactNode) => (
  <DialogBody className='flex flex-col gap-y-small'>{body}</DialogBody>
);

const renderActions = (actions: React.ReactNode) => <DialogFooter>{actions}</DialogFooter>;

const preventDialogDismiss = (event: Event) => event.preventDefault();

const PollSection: React.FC<PollSectionProps> = ({
  groupId,
  vertical,
  onPollCreated,
  onPollRemoved,
  translate,
  existingFormId,
  isReadOnly = false,
  renderContainer
}) => {
  const [isBuilderOpen, setBuilderOpen] = useState(false);
  const [createdForm, setCreatedForm] = useState<CustomForm | null>(null);
  // Locally tracks a user-initiated remove so the server-truth `existingForm` fetch doesn't
  // bleed back through while the composer is still open. Cleared when a new poll is created.
  const [isRemoved, setIsRemoved] = useState(false);

  const { data: existingForm } = useQuery({
    queryKey: queryKeys.getFormResultsKey(groupId, existingFormId ?? 0),
    queryFn: () => customFormsService.getFormResults(groupId, vertical, existingFormId as number),
    enabled: !!existingFormId,
    select: data => data.form
  });

  const displayForm = isRemoved ? null : createdForm ?? existingForm ?? null;

  const { mutate, reset, error: createPollError, isLoading: isCreatePollLoading } = useCreatePoll({
    groupId,
    vertical,
    onSuccess: (form: CustomForm) => {
      setIsRemoved(false);
      setCreatedForm(form);
      setBuilderOpen(false);
      onPollCreated(form.formId);
    }
  });

  const serverErrors = useMemo(() => extractServerErrors(createPollError), [createPollError]);

  const handleSave = useCallback(
    (request: CreateFormRequest) => {
      CommunityEventStream.sendEvent(getPollCreationButtonClickEvent('save'));
      mutate(request);
    },
    [mutate]
  );

  const handleRemove = useCallback(() => {
    setIsRemoved(true);
    setCreatedForm(null);
    onPollRemoved();
  }, [onPollRemoved]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        reset();
      }
      setBuilderOpen(isOpen);
    },
    [reset]
  );

  const showRemoveButton = !!displayForm && !isReadOnly;
  const showPlaceholder = !isReadOnly && !displayForm;

  // Read-only with no poll has nothing to show or do, so skip the empty card entirely. That covers
  // a published announcement that never had one, and one whose poll is still loading or failed to.
  if (isReadOnly && !displayForm) return null;

  let action: React.ReactNode = null;
  if (showPlaceholder) {
    action = (
      <MetricsElement metric={getPollCreationButtonClickEvent('create')}>
        <Button
          variant='Standard'
          size='Medium'
          onClick={() => setBuilderOpen(true)}
          isDisabled={isCreatePollLoading}>
          <span className='attachment-card-button-content'>
            <Icon name='icon-regular-plus-large' size='Small' />
            {translate('Action.AddPoll')}
          </span>
        </Button>
      </MetricsElement>
    );
  } else if (showRemoveButton) {
    action = (
      <MetricsElement metric={getPollCreationButtonClickEvent('remove')}>
        <Button
          className='poll-section-remove-btn'
          variant='Standard'
          size='Medium'
          onClick={handleRemove}>
          {translate('Action.RemovePoll')}
        </Button>
      </MetricsElement>
    );
  }

  const section = (
    <div className='poll-section'>
      {showPlaceholder && <MetricsElement metric={getPollCreateShownEvent()} isOneTimeEvent />}
      <AttachmentCard
        className={classNames('poll-section-body', showPlaceholder && 'poll-section-placeholder')}
        media={<Icon name='icon-regular-chart-three-horizontal-bars' size='Medium' />}
        mediaSize='Small'
        title={translate('Heading.Poll')}
        description={translate('Description.AnnouncementPoll')}
        action={action}>
        {displayForm && (
          <PollDisplay form={displayForm} hideDescription disabled translate={translate} />
        )}
      </AttachmentCard>
      {!isReadOnly && (
        <Dialog
          open={isBuilderOpen}
          onOpenChange={handleOpenChange}
          size='Medium'
          isModal
          hasCloseAffordance
          closeLabel='Close'>
          <DialogContent
            className='poll-section-dialog-content'
            {...({
              onPointerDownOutside: preventDialogDismiss,
              onInteractOutside: preventDialogDismiss
            } as Record<string, unknown>)}>
            <DialogTitle hidden>{translate('Heading.CreatePoll')}</DialogTitle>
            <PollBuilderForm
              onSave={handleSave}
              onCancel={() => handleOpenChange(false)}
              serverErrors={serverErrors}
              hideDescription
              renderBody={renderBody}
              renderActions={renderActions}
              translate={translate}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  return <React.Fragment>{renderContainer ? renderContainer(section) : section}</React.Fragment>;
};

PollSection.displayName = 'PollSection';

export default PollSection;
