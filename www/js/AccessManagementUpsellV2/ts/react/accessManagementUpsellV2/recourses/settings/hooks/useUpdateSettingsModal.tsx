import React, { useMemo, useState, useEffect } from 'react';
import { IModalService, Modal } from 'react-style-guide';
import { Button } from '@rbx/foundation-ui';
import { LegallySensitiveContentService } from 'Roblox';
import settingTranslationConstants from '../constants/settingTranslationConstants';
import { TCreateSettingsModal } from '../../../types/AmpTypes';
import { ConsentFormInnerComponents } from '../components/ConsentFormInnerComponents';
import ConsentFormType from '../enums/ConsentFormType';
import { getConsentNameForSetting, getSettingNameForSetting } from '../constants/consentConstants';
import { getCancelEvent, getCloseModalEvent, getConfirmEvent } from '../services/eventService';

const useUpdateSettingsModal: TCreateSettingsModal = (
  translate,
  {
    title,
    body,
    actionButtonText,
    neutralButtonText,
    onAction,
    onHide,
    onNeutral,
    consentFormType,
    surface,
    context
  },
  settingsRecourseMetadata
) => {
  const consentName = getConsentNameForSetting(settingsRecourseMetadata.settingName);
  const [
    legallySensitiveContent,
    legallySensitiveActions
  ] = LegallySensitiveContentService.useLegallySensitiveContentAndActions(consentName, surface);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const modalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => setModalOpen(false)
    }),
    []
  );
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (consentFormType === ConsentFormType.Notice) {
      setIsChecked(true);
    }
  }, [consentFormType]);

  const getConsentForm = (): JSX.Element => {
    const ConsentFormInnerComponent =
      ConsentFormInnerComponents[consentFormType as ConsentFormType];
    if (!ConsentFormInnerComponent) return <React.Fragment />;

    return (
      <div className='consent-form'>
        <ConsentFormInnerComponent
          isChecked={isChecked}
          setIsChecked={setIsChecked}
          wordsOfConsent={legallySensitiveContent.wordsOfConsent.consent}
        />
      </div>
    );
  };

  const modal = (
    <Modal
      show={modalOpen}
      onHide={() => {
        modalService.close();
        onHide();
      }}
      backdrop
      className='access-management-upsell-inner-modal user-settings-modal'
      size='md'
      aria-labelledby='user-settings-modal-title'
      scrollable
      centered>
      <Modal.Header useBaseBootstrapComponent>
        <div className='user-settings-modal-title-container'>
          <Modal.Title id='user-settings-modal-title'>
            {legallySensitiveContent.wordsOfConsent.title || title}
          </Modal.Title>
        </div>
        <button
          type='button'
          className='close close-button'
          title={translate(settingTranslationConstants.close)}
          onClick={() => {
            getCloseModalEvent(settingsRecourseMetadata.settingName, context);
            modalService.close();
            onHide();
          }}>
          <span className='icon-close' />
        </button>
      </Modal.Header>
      <Modal.Body>
        {body}
        {getConsentForm()}
      </Modal.Body>
      <Modal.Footer>
        <Button
          className='modal-half-width-button'
          variant='Standard'
          size='Medium'
          onClick={() => {
            getCancelEvent(settingsRecourseMetadata.settingName, context);
            modalService.close();
            onNeutral?.();
            onHide();
          }}>
          {legallySensitiveContent.wordsOfConsent.neutralButtonText || neutralButtonText}
        </Button>
        <Button
          className='modal-half-width-button modal-primary-button'
          variant='Emphasis'
          size='Medium'
          isDisabled={!isChecked}
          onClick={() => {
            getConfirmEvent(settingsRecourseMetadata.settingName, context);
            modalService.close();
            legallySensitiveActions.updateSettingWithAuditing(
              getSettingNameForSetting(settingsRecourseMetadata.settingName),
              settingsRecourseMetadata.settingValue
            );
            onAction?.();
            onHide();
          }}>
          {legallySensitiveContent.wordsOfConsent.actionButtonText || actionButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return [modal, modalService];
};

export default useUpdateSettingsModal;
