import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-style-guide';

const SIGNIN_INSTRUCTIONS_USERNAME_TOKEN = '{username}';

function renderSigninInstructionsLead(translate, accountDisplayName) {
  const template = translate('Heading.SigninInstructions');
  const token = SIGNIN_INSTRUCTIONS_USERNAME_TOKEN;
  const tokenStart = template.indexOf(token);
  if (tokenStart !== -1 && template.lastIndexOf(token) === tokenStart) {
    const tokenEnd = tokenStart + token.length;
    return (
      <React.Fragment>
        {template.slice(0, tokenStart)}
        <span className='quick-sign-in-username'>{accountDisplayName}</span>
        {template.slice(tokenEnd)}
      </React.Fragment>
    );
  }
  return translate('Heading.SigninInstructions', { username: accountDisplayName });
}

function CrossDeviceCodeInputModule({
  translate,
  accountDisplayName,
  handleCodeChange,
  handleCodeSubmit,
  codeValue,
  shouldDisable
}) {
  return (
    <div className='enter-code-container'>
      <h2>{translate('Heading.SigninAnotherDevice')}</h2>
      <p className='quick-sign-in-lead text-default'>
        {renderSigninInstructionsLead(translate, accountDisplayName)}
      </p>
      <ol className='enter-code-list quick-sign-in-instruction-list text-default'>
        <li>{translate('Label.SigninInstructionOne')}</li>
        <li>{translate('Label.SigninInstructionTwo')}</li>
        <li>{translate('Label.SigninInstructionThree')}</li>
      </ol>
      <form className='quick-sign-in-form' onSubmit={event => handleCodeSubmit(event)}>
        <div className='quick-sign-in-field-row'>
          <input
            className='quick-sign-in-input input-field form-control'
            type='text'
            placeholder={translate('Label.EnterCodeTextBox')}
            onChange={event => handleCodeChange(event.target.value)}
            value={codeValue}
          />
          <Button
            type='submit'
            className='quick-sign-in-confirm-btn btn-cta-md'
            isDisabled={shouldDisable || codeValue.match('^[a-zA-Z0-9]{6}$') == null}>
            {translate('Label.Continue')}
          </Button>
        </div>
      </form>
      <p className='quick-sign-in-disclaimer text-muted'>
        {translate('Label.QuickSignInWarning')}
      </p>
    </div>
  );
}

CrossDeviceCodeInputModule.propTypes = {
  translate: PropTypes.func.isRequired,
  accountDisplayName: PropTypes.string.isRequired,
  handleCodeChange: PropTypes.func.isRequired,
  handleCodeSubmit: PropTypes.func.isRequired,
  codeValue: PropTypes.string.isRequired,
  shouldDisable: PropTypes.bool.isRequired
};

export default CrossDeviceCodeInputModule;
