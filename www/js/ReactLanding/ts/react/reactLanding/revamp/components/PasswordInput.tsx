import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { IconButton, TextInput, TTextInputProps } from '@rbx/foundation-ui';
import { passwordMaxLength, passwordMinLength } from '../../constants/signupConstants';

export type PasswordInputProps = {
  reserveErrorSpace?: boolean;
  onChange: (value: string) => void;
  onShowPassword?: () => void;
  onHidePassword?: () => void;
} & Omit<
  TTextInputProps,
  'onChange' | 'leadingIconName' | 'leadingIconNode' | 'trailingIconName' | 'trailingIconNode'
>;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ reserveErrorSpace = true, onChange, onShowPassword, onHidePassword, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className='flex flex-col gap-small'>
        <TextInput
          size='Medium'
          minLength={passwordMinLength}
          maxLength={passwordMaxLength}
          required
          autoComplete='new-password'
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className='relative'
          trailingIconNode={
            <React.Fragment>
              <div className='width-600 grow-0 shrink-0 basis-auto' />
              <div className='absolute ltr:right-[0] rtl:left-[0]'>
                <IconButton
                  size='Medium'
                  variant='Utility'
                  icon={showPassword ? 'icon-regular-eye-slash' : 'icon-regular-eye'}
                  // TODO: replace translation with 'Label.ShowPassword' and 'Label.HidePassword' when available
                  // eslint-disable-next-line react/jsx-no-literals
                  ariaLabel={showPassword ? 'Hide Password' : 'Show Password'}
                  onClick={() => {
                    const newValue = !showPassword;
                    setShowPassword(newValue);
                    if (newValue) {
                      onShowPassword?.();
                    } else {
                      onHidePassword?.();
                    }
                  }}
                />
              </div>
            </React.Fragment>
          }
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

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
