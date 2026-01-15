export interface TrackedObject {
  id: string;
  lat: number;
  lon: number;
  heading: number; // 0-360 degrees
  speed: number; // km/h
}

export interface WSMessage {
  type: 'init' | 'update' | 'auth';
  timestamp?: number;
  objects?: TrackedObject[];
  success?: boolean;
  error?: string;
}

export interface AuthRequest {
  type: 'auth';
  apiKey: string;
}
