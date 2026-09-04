import React from 'react';
import { useTranslation } from 'react-utilities';
import { LoginStep } from '../loginState';
import SecurityNotificationModal from '../../components/SecurityNotificationModal';

const SecurityNotification = ({
  credential
}: Omit<LoginStep & { step: 'security-notification' }, 'step'>): JSX.Element | null => {
  const { translate } = useTranslation();
  return <SecurityNotificationModal credentialValue={credential.value} translate={translate} />;
};

export default SecurityNotification;
