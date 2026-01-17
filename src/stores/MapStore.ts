import { makeAutoObservable, observable } from 'mobx';

import { LOST_CHECK_INTERVAL, LOST_TIMEOUT, WS_URL } from '../constants';
import { WsClient } from '../services/wsClient';
import type { TrackedObject } from '../types';
import type { RootStore } from './RootStore';

export class MapStore {
  rootStore: RootStore;
  objects: Map<string, TrackedObject & { status: 'active' | 'lost'; lastSeen: number }> =
    observable(new Map());
  wsClient: WsClient | null = null;
  isConnected: boolean = false;
  isConnecting: boolean = false;
  error: string | null = null;
  stats = observable({
    total: 0,
    active: 0,
    lost: 0,
  });

  lostCheckInterval: ReturnType<typeof setInterval> | null = null;
  private apiKey: string = '';

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      objects: observable,
      wsClient: false,
      lostCheckInterval: false,
      rootStore: false,
    });
  }

  connect = (apiKey: string) => {
    if (this.isConnecting || this.isConnected) return;

    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = null;
    }

    this.apiKey = apiKey;
    this.isConnecting = true;
    this.error = null;

    try {
      this.wsClient = new WsClient(WS_URL);

      this.wsClient.connect({
        onOpen: () => {
          this.isConnected = true;
          this.isConnecting = false;

          // Send auth message
          this.wsClient?.send({ type: 'auth', apiKey: this.apiKey });

          this.startLostObjectsCheck();
        },
        onMessage: (data) => {
          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'init' || parsed.type === 'update') {
              this.updateObjects(parsed.objects || []);
            } else if (parsed.type === 'auth') {
              if (!parsed.success) {
                this.error = parsed.error || 'Authentication failed';
                this.disconnect();
              }
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        },
        onError: () => {
          this.error = 'WebSocket connection error';
          this.isConnected = false;
          this.isConnecting = false;
        },
        onClose: () => {
          this.isConnected = false;
          this.isConnecting = false;
          this.stopLostObjectsCheck();
        },
      });
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Connection failed';
      this.isConnecting = false;
    }
  };

  disconnect = () => {
    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = null;
    }
    this.isConnected = false;
    this.stopLostObjectsCheck();
    this.objects.clear();
    this.updateStats();
  };

  private updateObjects = (newObjects: TrackedObject[]) => {
    const now = Date.now();

    newObjects.forEach((obj) => {
      this.objects.set(obj.id, {
        ...obj,
        status: obj.active ? 'active' : 'lost',
        lastSeen: now,
      });
    });

    this.updateStats();
  };

  private startLostObjectsCheck = () => {
    this.lostCheckInterval = setInterval(() => {
      this.checkLostObjects();
    }, LOST_CHECK_INTERVAL);
  };

  private stopLostObjectsCheck = () => {
    if (this.lostCheckInterval) {
      clearInterval(this.lostCheckInterval);
      this.lostCheckInterval = null;
    }
  };

  private checkLostObjects = () => {
    const now = Date.now();
    const toDelete: string[] = [];

    this.objects.forEach((obj, id) => {
      const timeSinceSeen = now - obj.lastSeen;

      if (timeSinceSeen > LOST_TIMEOUT) {
        // Remove objects older than 5 minutes
        toDelete.push(id);
      } else if (timeSinceSeen > LOST_TIMEOUT / 2) {
        // Mark as lost after 2.5 minutes
        obj.status = 'lost';
      }
    });

    toDelete.forEach((id) => this.objects.delete(id));

    if (toDelete.length > 0) {
      this.updateStats();
    }
  };

  private updateStats = () => {
    const total = this.objects.size;
    const active = Array.from(this.objects.values()).filter(
      (obj) => obj.status === 'active',
    ).length;
    const lost = total - active;

    this.stats.total = total;
    this.stats.active = active;
    this.stats.lost = lost;
  };

  getActiveObjects = () => {
    return Array.from(this.objects.values()).filter((obj) => obj.status === 'active');
  };

  getLostObjects = () => {
    return Array.from(this.objects.values()).filter((obj) => obj.status === 'lost');
  };

  getAllObjects = () => {
    return Array.from(this.objects.values());
  };
}
