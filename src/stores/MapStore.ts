import { makeAutoObservable, observable } from 'mobx';
import type { TrackedObject } from '../types';

const LOST_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const WS_URL = 'ws://localhost:8080';

export class MapStore {
  objects: Map<string, TrackedObject & { status: 'active' | 'lost'; lastSeen: number }> = observable(
    new Map()
  );
  ws: WebSocket | null = null;
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

  constructor() {
    makeAutoObservable(this, {
      objects: observable,
      ws: false,
      lostCheckInterval: false,
    });
  }

  connect = (apiKey: string) => {
    if (this.isConnecting || this.isConnected) return;

    this.apiKey = apiKey;
    this.isConnecting = true;
    this.error = null;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.isConnecting = false;
        console.log('WebSocket connected');

        // Send auth message
        if (this.ws) {
          this.ws.send(JSON.stringify({ type: 'auth', apiKey: this.apiKey }));
        }

        // Start checking for lost objects
        this.startLostObjectsCheck();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'init' || data.type === 'update') {
            this.updateObjects(data.objects || []);
          } else if (data.type === 'auth') {
            if (!data.success) {
              this.error = data.error || 'Authentication failed';
              this.disconnect();
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      this.ws.onerror = () => {
        this.error = 'WebSocket connection error';
        this.isConnected = false;
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.isConnecting = false;
        this.stopLostObjectsCheck();
      };
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Connection failed';
      this.isConnecting = false;
    }
  };

  disconnect = () => {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
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
        status: 'active',
        lastSeen: now,
      });
    });

    this.updateStats();
  };

  private startLostObjectsCheck = () => {
    this.lostCheckInterval = setInterval(() => {
      this.checkLostObjects();
    }, 30000); // Check every 30 seconds
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
    const active = Array.from(this.objects.values()).filter((obj) => obj.status === 'active')
      .length;
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

export const mapStore = new MapStore();
