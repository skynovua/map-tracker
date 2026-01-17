import { makeAutoObservable } from 'mobx';

import { AuthStore } from './AuthStore';
import { MapStore } from './MapStore';

export class RootStore {
  authStore: AuthStore;
  mapStore: MapStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.mapStore = new MapStore(this);

    makeAutoObservable(this);
  }
}

// Singleton instance
export const rootStore = new RootStore();
