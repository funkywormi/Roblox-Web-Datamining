import type { FunctionComponent } from 'react';
import React from 'react';
import alertDark from '@rbx/foundation-images/pictograms/alert_dark.svg';
import alertLight from '@rbx/foundation-images/pictograms/alert_light.svg';
import { Button } from '@rbx/foundation-ui';
import { useTranslation, withTranslation } from '@rbx/intl';
import TranslationNamespace from '../constants/TranslationNamespace';
import StatePanel from './StatePanel';
import ThemedImage from './ThemedImage';

export type ErrorStateProps = {
  onRetry?: () => void;
  title?: string;
  message?: string;
  className?: string;
};

const ErrorState: FunctionComponent<ErrorStateProps> = ({ onRetry, title, message, className }) => {
  const { translate } = useTranslation();

  return (
    <StatePanel
      className={className}
      testId='group-management-error-state'
      illustration={<ThemedImage lightSrc={alertLight} darkSrc={alertDark} alt='' />}
      title={title ?? translate('Heading.GenericError')}
      description={message ?? translate('Message.FailedToLoadPage')}
      action={
        onRetry ? (
          <Button variant='Standard' size='Medium' onClick={onRetry}>
            {translate('Action.FailedToLoadPage')}
          </Button>
        ) : undefined
      }
    />
  );
};

export default withTranslation(ErrorState, [TranslationNamespace.Error]);
