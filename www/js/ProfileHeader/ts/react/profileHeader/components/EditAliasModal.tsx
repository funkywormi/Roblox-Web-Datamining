import React, { useEffect, useState } from 'react';
import { EventStream } from 'Roblox';
import { createModal } from 'react-style-guide';
import classNames from 'classnames';
import { UserProfileField, writeQuery } from 'roblox-user-profiles';
import contactsService from '../services/contactsService';
import useProfileHeaderContext from '../hooks/useProfileHeaderContext';
import constants from '../constants/profileHeaderConstants';
import { ActionType } from '../store/action';

const AliasInputBox = ({
  currName,
  currTextCount,
  placeHolderText,
  errorText,
  inputClassNames,
  fireMaxLimitAlias,
  fireClearedAlias,
  setHasErrored
}: {
  currName: string;
  currTextCount: number;
  placeHolderText: string;
  errorText: string;
  inputClassNames: string;
  fireMaxLimitAlias: (alias: string) => void;
  fireClearedAlias: () => void;
  setHasErrored: (hasErrored: boolean) => void;
}) => {
  const [currentName, setCurrentName] = useState<string>(currName);
  const [textCount, setTextCount] = useState<number>(currTextCount);

  // Counts the number of unicode characters (as opposed to the number of unicode code units
  // obtained via `.length`)
  //
  // Note: There is a known issue with niche complex emojis such as 👩‍❤️‍💋‍👩 where they will
  // still counted as multiple characters. One possible solution would be to use `Intl.Segmenter`.
  // See:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length#description
  // for more information.
  const unicodeLength = (str: string) => Array.from(str).length;

  const updateCurrentName = (e: React.FormEvent<HTMLInputElement>) => {
    let newName = e.currentTarget.value;
    let unicodeLen = unicodeLength(newName);
    if (unicodeLen > constants.maxCharactersForAlias) {
      if (textCount === constants.maxCharactersForAlias) {
        return;
      }

      newName = Array.from(newName).slice(0, constants.maxCharactersForAlias).join('');
      unicodeLen = constants.maxCharactersForAlias;
    }

    setCurrentName(newName);
    setTextCount(unicodeLen);

    if (unicodeLen === constants.maxCharactersForAlias) {
      fireMaxLimitAlias(newName);
    }
    if (unicodeLen === 0) {
      fireClearedAlias();
    }
    setHasErrored(false);
  };

  const countdownText = `${textCount}/${constants.maxCharactersForAlias}`;
  return (
    <div className={inputClassNames}>
      <input
        className='form-control input-field'
        id='aliasInputBox'
        onChange={updateCurrentName}
        value={currentName}
        placeholder={placeHolderText}
      />
      <div className='clearfix font-caption-body change-alias-feedback-container'>
        <span className='count-down'>{countdownText}</span>
        <span className='form-control-label'>{errorText}</span>
      </div>
    </div>
  );
};

const EditAliasModal = ({
  translate,
  profileUserId
}: {
  translate: (key: string) => string;
  profileUserId: number;
}): JSX.Element | null => {
  const { state, dispatch } = useProfileHeaderContext();
  const [AliasModal, modalService] = createModal();
  const hideAliasEditModal = () => {
    dispatch({ type: ActionType.SHOW_ALIAS_EDIT_MODAL, show: false });
  };

  const [currentName, setCurrentName] = useState<string>('');
  const [textCount, setTextCount] = useState<number>(0);
  const [hasErrored, setHasErrored] = useState<boolean>(false);

  const errorText = hasErrored ? translate(constants.translationKeys.invalidAlias) : '';
  const placeHolderText = translate(constants.translationKeys.customizeNamePlaceholder);
  const descriptionHeader = `${translate(constants.translationKeys.setCustomName)} `;
  const descriptionText = translate(constants.translationKeys.recognizeFriends);
  const modalTitle = translate(constants.translationKeys.customizeName);

  const fireCustomNameModalOpened = React.useCallback(() => {
    EventStream.SendEventWithTarget(
      constants.eventNames.modalOpen,
      constants.eventCtx.customizeName,
      {
        origin: 'userProfile',
        playerId: profileUserId.toString()
      },
      EventStream.TargetTypes.WWW
    );
  }, [profileUserId]);

  const fireCustomNameModalClosed = React.useCallback(() => {
    EventStream.SendEventWithTarget(
      constants.eventNames.buttonClick,
      constants.eventCtx.customizeName,
      {
        btn: constants.eventBtns.closeCustomName,
        playerId: profileUserId.toString()
      },
      EventStream.TargetTypes.WWW
    );
  }, [profileUserId]);

  const fireCustomNameSaved = (alias: string) => {
    EventStream.SendEventWithTarget(
      constants.eventNames.buttonClick,
      constants.eventCtx.customizeName,
      {
        btn: constants.eventBtns.saveAlias,
        alias,
        playerId: profileUserId.toString()
      },
      EventStream.TargetTypes.WWW
    );
  };

  const fireCustomNameSaveFailed = (alias: string) => {
    EventStream.SendEventWithTarget(
      constants.eventNames.customNameInvalidInput,
      constants.eventCtx.customizeName,
      {
        alias,
        playerId: profileUserId.toString()
      },
      EventStream.TargetTypes.WWW
    );
  };

  const fireMaxLimitAlias = (alias: string) => {
    EventStream.SendEventWithTarget(
      constants.eventNames.customNameMaxLimit,
      constants.eventCtx.customizeName,
      {
        alias,
        playerId: profileUserId.toString()
      },
      EventStream.TargetTypes.WWW
    );
  };

  const fireClearedAlias = () => {
    EventStream.SendEventWithTarget(
      constants.eventNames.customNameClearedInput,
      constants.eventCtx.customizeName,
      {
        playerId: profileUserId.toString()
      },
      EventStream.TargetTypes.WWW
    );
  };

  const unicodeLength = (str: string) => Array.from(str).length;

  const resetAliasModal = React.useCallback(() => {
    setCurrentName(state.names.alias || '');
    setTextCount(unicodeLength(state.names.alias || ''));
    setHasErrored(false);
  }, [state.names.alias]);

  const closeAliasModal = React.useCallback(() => {
    resetAliasModal();
    modalService.close();
    fireCustomNameModalClosed();
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    });
  }, [modalService, fireCustomNameModalClosed, resetAliasModal]);

  const openAliasModal = React.useCallback(() => {
    modalService.open();
    fireCustomNameModalOpened();
  }, [modalService, fireCustomNameModalOpened]);

  const inputClassNames = classNames(`form-group`, {
    'form-has-error': hasErrored,
    'form-has-feedback': true
  });

  const userProfileFields = [
    UserProfileField.Names.CombinedName,
    UserProfileField.Names.Username,
    UserProfileField.Names.DisplayName,
    UserProfileField.Names.Alias
  ];

  const setAlias = (alias: string): void => {
    contactsService.setUserTag(profileUserId, alias).then(
      response => {
        if (response.status === 'Success') {
          if (alias === '') {
            writeQuery(profileUserId, userProfileFields, {
              names: {
                alias,
                combinedName: state.names.displayName,
                displayName: state.names.displayName,
                username: state.names.username
              }
            });
          } else {
            writeQuery(profileUserId, userProfileFields, {
              names: {
                alias,
                combinedName: alias,
                displayName: state.names.displayName,
                username: state.names.username
              }
            });
          }
          fireCustomNameSaved(alias);
          hideAliasEditModal();
        } else {
          fireCustomNameSaveFailed(alias);
          setHasErrored(true);
        }
      },
      () => {
        setHasErrored(true);
      }
    );
  };

  useEffect(() => {
    if (state.showAliasEditModal) {
      openAliasModal();
    } else {
      closeAliasModal();
    }
  }, [closeAliasModal, openAliasModal, state.showAliasEditModal]);

  return state.showAliasEditModal ? (
    <AliasModal
      title={modalTitle}
      body={
        <div className='change-alias-modal'>
          <div className='text-label'>
            <span>{descriptionHeader}</span>
            <span className='change-alias-bolded'>{state.names.displayName}</span>
          </div>
          <div className='change-alias-description'>{descriptionText}</div>
          <AliasInputBox
            currName={currentName}
            currTextCount={textCount}
            placeHolderText={placeHolderText}
            errorText={errorText}
            inputClassNames={inputClassNames}
            fireMaxLimitAlias={fireMaxLimitAlias}
            fireClearedAlias={fireClearedAlias}
            setHasErrored={setHasErrored}
          />
        </div>
      }
      actionButtonShow
      disableActionButton={hasErrored}
      actionButtonText={translate(constants.translationKeys.save)}
      neutralButtonText={translate(constants.translationKeys.cancel)}
      onNeutral={() => {
        hideAliasEditModal();
      }}
      onAction={() => {
        const aliasInputElement = document.getElementById('aliasInputBox') as HTMLInputElement;
        const aliasValue = aliasInputElement?.value || '';
        setAlias(aliasValue);
      }}
    />
  ) : null;
};

export default EditAliasModal;
