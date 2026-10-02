import type { FunctionComponent } from 'react';
import React from 'react';
import lockDark from '@rbx/foundation-images/pictograms/lock_dark.svg';
import lockLight from '@rbx/foundation-images/pictograms/lock_light.svg';
import { useTranslation, withTranslation } from '@rbx/intl';
import TranslationNamespace from '../constants/TranslationNamespace';
import StatePanel from './StatePanel';
import ThemedImage from './ThemedImage';

const PermissionDeniedState: FunctionComponent = () => {
  const { translate } = useTranslation();
  const title: unknown = translate('Description.AccessDenied', {});
  const description: unknown = translate('Label.AccessDenied', {});

  return (
    <StatePanel
      testId='group-management-permission-denied-state'
      title={typeof title === 'string' ? title : ''}
      description={typeof description === 'string' ? description : ''}
      illustration={<ThemedImage lightSrc={lockLight} darkSrc={lockDark} alt='' />}
    />
  );
};

export default withTranslation(PermissionDeniedState, [TranslationNamespace.Error]);
