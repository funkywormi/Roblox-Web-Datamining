import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Provider } from 'react-redux';
import { WizardApp } from '@rbx/amp-v2-wizard';
import AccessManagementContainer from './accessManagement/AccessManagementContainer';
import DownloadAppModal from './accessManagement/components/DownloadAppModal';
import { store } from './store';
import { accessManagementUpselTranslationConfig } from './app.config';
import LegallySensitiveContentContainer from '../legallySensitiveContent/LegallySensitiveContentContainer';
import vpcV2Handoff from './accessManagement/services/vpcV2Handoff';

function App({ translate }: WithTranslationsProps) {
  return (
    <Provider store={store}>
      <AccessManagementContainer translate={translate} vpcV2Handoff={vpcV2Handoff} />
      <DownloadAppModal translate={translate} />
      <LegallySensitiveContentContainer translate={translate} />
      <WizardApp />
    </Provider>
  );
}
export default withTranslations(App, accessManagementUpselTranslationConfig);
