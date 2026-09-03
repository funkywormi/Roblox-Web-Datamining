import { useContext } from 'react';
import singleButtonModalContext, {
  SingleButtonModalContext
} from '../utils/SingleButtonModalContext';

export default function useSingleButtonModalContext(): SingleButtonModalContext {
  return useContext(singleButtonModalContext);
}
