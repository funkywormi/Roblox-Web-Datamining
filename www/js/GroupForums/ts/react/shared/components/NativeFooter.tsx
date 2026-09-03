import React, { ReactNode, useEffect } from 'react';
import classNames from 'classnames';
import useAppBumperVisibility from '../hooks/useAppBumperVisibility';

export type NativeFooterProps = {
  children: ReactNode;
  fixed?: boolean;
  footerContainerClass?: string;
};

const NativeFooter = ({
  fixed,
  children,
  footerContainerClass = 'groups-page-footer'
}: NativeFooterProps): JSX.Element => {
  const isBumperVisible = useAppBumperVisibility();

  useEffect(() => {
    if (!fixed) {
      return () => null;
    }
    // when the native footer is fixed, it overlaps the bottom of the screen
    // this class adds padding to the global page footer to prevent overlap
    document.getElementById('footer-container')?.classList.add(footerContainerClass);
    return () => {
      document.getElementById('footer-container')?.classList.remove(footerContainerClass);
    };
  }, [fixed, footerContainerClass]);

  return (
    <div
      className={classNames(
        'groups-native-footer',
        fixed && 'groups-native-footer-fixed',
        fixed && isBumperVisible && 'groups-native-footer-with-bumper'
      )}>
      {children}
    </div>
  );
};

export default NativeFooter;
