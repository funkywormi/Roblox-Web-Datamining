import React from 'react';
import IdVerificationContainer from './container/IdVerificationContainer';
import { IdVerificationStateProvider } from './stores/IdVerificationStoreContext';
import { ModalEntry } from './constants/viewConstants';
import { useIdVerificationTranslate } from './hooks/useIdVerificationTranslate';
import '../../../css/idVerification/viewTemplate.css';
import '../../../css/idVerification/emailUpsell.css';
import '../../../css/idVerification/idvModal.css';

function App({ entry = ModalEntry.WebApp }: { entry?: string }) {
  const translate = useIdVerificationTranslate();
  return (
    <IdVerificationStateProvider>
      <IdVerificationContainer translate={translate} entry={entry} />
    </IdVerificationStateProvider>
  );
}

export default App;
