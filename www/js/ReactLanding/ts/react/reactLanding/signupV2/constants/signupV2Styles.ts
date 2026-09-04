import { SignUpV2Treatment } from '../utils/signupV2ExperimentUtils';

const signupV2CardBaseClassName = 'signup-v2-card flex flex-col bg-surface-100 radius-large';

const signupV2CardClassName = `${signupV2CardBaseClassName} padding-xlarge`;

export const signupV2CompactCardClassName = `${signupV2CardBaseClassName} padding-large`;

export const getSignUpV2CardClassName = (treatment: SignUpV2Treatment): string =>
  treatment === SignUpV2Treatment.FoundationControl
    ? signupV2CompactCardClassName
    : signupV2CardClassName;

export const signupV2CardContentClassName = 'flex width-full flex-col';

export const signupV2CardResizingClassName = 'signup-v2-card-resizing';

export default signupV2CardClassName;
