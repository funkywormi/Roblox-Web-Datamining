import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { RadioGroup, Radio } from '@rbx/foundation-ui';
import { useSystemFeedback } from 'react-style-guide';
import Configuration, { SlowModeLevel } from '../constants/groupContentModerationConstants';
import { useSlowModeSettings } from '../hooks/useSlowModeSettings';
import { groupsConfig } from '../../shared/translation.config';
import SingleSelection from '../../shared/components/SingleSelection';

export type SlowModeSectionProps = {
  groupId: number;
  readonlyMode: boolean;
} & WithTranslationsProps;

const SlowModeSection = ({
  groupId,
  translate,
  readonlyMode
}: SlowModeSectionProps): JSX.Element => {
  const { SystemFeedbackComponent } = useSystemFeedback();

  const { slowModeLevel, isLoading, handleSlowModeChange, slowModeOptions } = useSlowModeSettings({
    groupId,
    translate
  });

  return (
    <div className='section-content slowmode-section'>
      <SingleSelection
        options={slowModeOptions}
        value={slowModeLevel?.toString() ?? ''}
        onChange={e => {
          handleSlowModeChange(parseInt(e, 10) as SlowModeLevel);
        }}
        header={translate(Configuration.slowModeConfig.translationKeys.headings.slowMode)}
        subheader={translate(
          Configuration.slowModeConfig.translationKeys.headings.slowModeDescription
        )}
        disabled={isLoading || readonlyMode}
      />
      <SystemFeedbackComponent />
    </div>
  );
};

export default withTranslations(SlowModeSection, groupsConfig);
