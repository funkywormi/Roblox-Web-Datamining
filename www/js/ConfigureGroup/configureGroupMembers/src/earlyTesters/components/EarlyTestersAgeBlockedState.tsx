import type { FunctionComponent } from 'react';
import React from 'react';
import verifyIdDark from '@rbx/foundation-images/pictograms/verifyid_dark.svg';
import verifyIdLight from '@rbx/foundation-images/pictograms/verifyid_light.svg';
import { useTranslation, withTranslation } from '@rbx/intl';
import EmptyState from '../../components/EmptyState';
import TranslationNamespace from '../../constants/TranslationNamespace';
import { EARLY_TESTER_MIN_OWNER_AGE } from '../../utils/constants';

const ILLUSTRATION = { light: verifyIdLight, dark: verifyIdDark };

const EarlyTestersAgeBlockedState: FunctionComponent = () => {
  const { translateWithNamespace } = useTranslation();

  return (
    <EmptyState
      illustration={ILLUSTRATION}
      title={translateWithNamespace(
        TranslationNamespace.Creations,
        'Heading.EarlyTestersAgeBlocked',
      )}
      description={translateWithNamespace(
        TranslationNamespace.Creations,
        'Description.EarlyTestersAgeBlocked',
        { age: EARLY_TESTER_MIN_OWNER_AGE.toString() },
      )}
    />
  );
};

export default withTranslation(EarlyTestersAgeBlockedState, [TranslationNamespace.Creations]);
