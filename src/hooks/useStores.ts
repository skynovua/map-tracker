import { useMemo } from 'react';
import { authStore } from '../stores/AuthStore';
import { mapStore } from '../stores/MapStore';

// Provides stable references to MobX stores for React components
export const useStores = () => {
  return useMemo(() => ({ authStore, mapStore }), []);
};
