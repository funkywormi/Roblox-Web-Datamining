import React, { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@rbx/foundation-ui';
import { PollBuilderForm, PollDisplay } from '@rbx/custom-forms';
import type { CreateFormRequest, CustomForm } from '@rbx/custom-forms';
import type { WithTranslationsProps } from 'react-utilities';

import useCreatePoll from '../hooks/useCreatePoll';
import customFormsService from '../services/customFormsService';
import { extractServerErrors } from '../utils/errorUtils';
import queryKeys from '../utils/queryKeys';
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
  isReadOnly = false
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

  return (
    <div className='poll-section'>
      {showPlaceholder && <MetricsElement metric={getPollCreateShownEvent()} isOneTimeEvent />}
      <div className='poll-section-header'>
        <h5 className='text-content-editor-label'>{translate('Heading.Poll')}</h5>
        {showRemoveButton && (
          <MetricsElement metric={getPollCreationButtonClickEvent('remove')}>
            <button
              type='button'
              className='poll-section-remove-btn text-link'
              onClick={handleRemove}>
              {translate('Action.RemovePoll')}
            </button>
          </MetricsElement>
        )}
      </div>
      <div className='poll-section-body radius-medium stroke-standard stroke-contrast-alpha'>
        {displayForm ? (
          <PollDisplay form={displayForm} hideDescription disabled translate={translate} />
        ) : (
          !isReadOnly && (
            <div className='poll-section-placeholder'>
              <MetricsElement metric={getPollCreationButtonClickEvent('create')}>
                <Button
                  variant='Standard'
                  size='Medium'
                  onClick={() => setBuilderOpen(true)}
                  isDisabled={isCreatePollLoading}>
                  {translate('Action.Create')}
                </Button>
              </MetricsElement>
            </div>
          )
        )}
      </div>
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
};

PollSection.displayName = 'PollSection';

export default PollSection;
