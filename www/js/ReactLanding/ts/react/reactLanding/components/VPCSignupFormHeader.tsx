import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import {
  signupFormStrings,
  vpcExperimentLayer,
  experimentVariables
} from '../constants/signupConstants';
import { signupTranslationConfig } from '../translation.config';
import '../../../../css/landing/signup.scss';
import useExperiments from '../../common/hooks/useExperiments';
import useSignupAuditContent from '../../common/hooks/useSignupAuditContent';

export type vpcSignupHeaderProps = {
  translate: WithTranslationsProps['translate'];
};

const SignupFormHeader = ({ translate }: vpcSignupHeaderProps): JSX.Element => {
  const {
    [experimentVariables.isParentSignUpDescriptionExperimentEnabled]: isParentSignUpDescriptionExperimentEnabled
  } = useExperiments(vpcExperimentLayer);
  const birthdateSelectionString = isParentSignUpDescriptionExperimentEnabled
    ? signupFormStrings.SelectBirthdateExp
    : signupFormStrings.SelectBirthdate;

  useSignupAuditContent(birthdateSelectionString, translate);

  return (
    <div className='text-center'>
      <h1 className='vpc-sign-header'>{translate(signupFormStrings.FinishAccountCreation)}</h1>
      <span className='vpc-signup-header-enter-birthday font-body text'>
        {translate(birthdateSelectionString)}
      </span>
    </div>
  );
};

export default withTranslations(SignupFormHeader, signupTranslationConfig);
