// WebSocket configuration (falls back to localhost for dev)
export const WS_URL =
  import.meta.env.VITE_WS_URL?.trim() && import.meta.env.VITE_WS_URL.trim() !== ''
    ? import.meta.env.VITE_WS_URL.trim()
    : 'ws://localhost:8080';

// Timeouts in milliseconds
export const LOST_TIMEOUT = 5 * 60 * 1000; // 5 minutes
export const LOST_CHECK_INTERVAL = 30 * 1000; // 30 seconds
export const UPDATE_INTERVAL = 1000; // 1 second
