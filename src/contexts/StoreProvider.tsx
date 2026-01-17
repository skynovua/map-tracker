import type { ReactNode } from 'react';

import { type RootStore, rootStore } from '@/stores/RootStore';

import { StoreContext } from './StoreContext';

interface StoreProviderProps {
  children: ReactNode;
  store?: RootStore;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children, store = rootStore }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};
