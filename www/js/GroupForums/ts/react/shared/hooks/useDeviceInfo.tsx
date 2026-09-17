import { useEffect, useState } from 'react';
import { DeviceMeta } from 'Roblox';

type DeviceInfoReturn = {
  isPhone: boolean;
};

const useDeviceInfo = (): DeviceInfoReturn => {
  const [isPhone, setIsPhone] = useState<boolean>(false);

  useEffect(() => {
    if (DeviceMeta) {
      setIsPhone(DeviceMeta().isPhone);
    }
  }, []);
  return {
    isPhone
  };
};

export default useDeviceInfo;
