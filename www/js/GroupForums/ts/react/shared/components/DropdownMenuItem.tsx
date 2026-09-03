import React, { createContext, useContext } from 'react';
import { MenuItem } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import '../../../../css/tailwind.css';
import { groupsConfig } from '../translation.config';

// The owning Popover is controlled, so selecting an item has to close it through this callback.
export const DropdownMenuCloseContext = createContext<() => void>(() => undefined);

export type DropdownMenuItemProps = {
  translateKey: string;
  action: () => void;
  disabled?: boolean;
  /** Optional stable selector for e2e tests */
  testId?: string;
} & WithTranslationsProps;

const DropdownMenuItem = ({
  translateKey,
  action,
  disabled,
  testId,
  translate
}: DropdownMenuItemProps): JSX.Element => {
  const closeMenu = useContext(DropdownMenuCloseContext);

  return (
    <MenuItem
      value={translateKey}
      title={translate(translateKey)}
      disabled={disabled}
      onSelect={() => {
        closeMenu();
        action();
      }}
      {...(testId ? { 'data-testid': testId } : {})}
    />
  );
};

export default withTranslations(DropdownMenuItem, groupsConfig);
