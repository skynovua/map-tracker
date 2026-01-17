import { useContext } from 'react';

import { StoreContext } from '../contexts/StoreContext';
import type { RootStore } from '../stores/RootStore';

export const useStore = (): RootStore => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return store;
};

export const useAuthStore = () => useStore().authStore;
export const useMapStore = () => useStore().mapStore;
