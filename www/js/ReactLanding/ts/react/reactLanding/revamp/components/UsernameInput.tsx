import React, { forwardRef } from 'react';
import { TextInput, TTextInputProps } from '@rbx/foundation-ui';
import {
  signupUsernameMaxLength,
  loginUsernameMaxLength,
  usernameMinLength
} from '../../constants/signupConstants';

export type UsernameInputProps = {
  reserveErrorSpace?: boolean;
  isSignup?: boolean;
  onChange: (value: string) => void;
} & Omit<
  TTextInputProps,
  'onChange' | 'leadingIconName' | 'leadingIconNode' | 'trailingIconName' | 'trailingIconNode'
>;

const UsernameInput = forwardRef<HTMLInputElement, UsernameInputProps>(
  ({ reserveErrorSpace = true, isSignup = true, onChange, ...props }, ref) => {
    const maxLength = isSignup ? signupUsernameMaxLength : loginUsernameMaxLength;

    return (
      <div className='flex flex-col gap-small'>
        <TextInput
          size='Medium'
          minLength={usernameMinLength}
          required
          autoComplete='username'
          {...props}
          maxLength={maxLength}
          ref={ref}
          onChange={e => onChange(e.target.value)}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
        />
        {
          // Reserving vertical space to prevent layout shift when hint text appears
          reserveErrorSpace && !props.error && !props.helperText ? (
            <span className='height-350' />
          ) : null
        }
      </div>
    );
  }
);

UsernameInput.displayName = 'UsernameInput';

export default UsernameInput;
