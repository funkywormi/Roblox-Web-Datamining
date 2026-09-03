import { useContext } from 'react';
import GameSubscriptionsContext, {
  GameSubscriptionsContextValues
} from '../utils/GameSubscriptionsContext';

export default function useGameSubscriptions(): GameSubscriptionsContextValues {
  const context = useContext(GameSubscriptionsContext);
  if (context === undefined || context === null) {
    throw new Error('GameSubscriptionsContext was not provided in the current scope.');
  }
  return context;
}
