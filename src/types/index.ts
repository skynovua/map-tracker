export interface TrackedObject {
  id: string;
  lat: number;
  lon: number;
  heading: number;
  speed: number;
  active: boolean;
  status: 'active' | 'lost';
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
