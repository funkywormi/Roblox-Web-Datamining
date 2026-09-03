import { useContext } from 'react';
import { ProfileHeaderContext, TProfileHeaderContext } from '../store/contextProvider';

const useProfileHeaderContext: () => TProfileHeaderContext = () => {
  const context = useContext(ProfileHeaderContext);
  if (context === null) {
    throw new Error('ProfileHeaderContext was not provided in the current scope');
  }

  return context;
};

export default useProfileHeaderContext;
