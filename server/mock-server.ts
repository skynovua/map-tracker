import { WebSocketServer, WebSocket } from 'ws';

interface TrackedObject {
  id: string;
  lat: number;
  lon: number;
  heading: number; // 0-360 degrees
  speed: number; // km/h
  lastUpdate: number;
  active: boolean;
}

const PORT = 8080;
const OBJECT_COUNT = 150; // Number of objects to track
const UPDATE_INTERVAL = 1000; // Update every 1 second
const INACTIVE_CHANCE = 0.001; // 0.1% chance per update to become inactive
const REACTIVATE_CHANCE = 0.05; // 5% chance to reactivate

// Kyiv coordinates as center
const CENTER_LAT = 50.4501;
const CENTER_LON = 30.5234;
const SPREAD = 0.5; // degrees spread around center

const objects = new Map<string, TrackedObject>();
const clients = new Set<WebSocket>();

// Initialize objects
function initializeObjects() {
  for (let i = 0; i < OBJECT_COUNT; i++) {
    const id = `OBJ-${String(i + 1).padStart(4, '0')}`;
    objects.set(id, {
      id,
      lat: CENTER_LAT + (Math.random() - 0.5) * SPREAD,
      lon: CENTER_LON + (Math.random() - 0.5) * SPREAD,
      heading: Math.floor(Math.random() * 360),
      speed: 30 + Math.random() * 70, // 30-100 km/h
      lastUpdate: Date.now(),
      active: true,
    });
  }
}

// Update object positions
function updateObjects() {
  objects.forEach((obj) => {
    // Random chance to become inactive/active
    if (obj.active && Math.random() < INACTIVE_CHANCE) {
      obj.active = false;
      console.log(`Object ${obj.id} became inactive`);
      return;
    } else if (!obj.active && Math.random() < REACTIVATE_CHANCE) {
      obj.active = true;
      console.log(`Object ${obj.id} reactivated`);
    }

    if (!obj.active) return;

    // Update position based on heading and speed
    const speedInDegreesPerSec = (obj.speed / 111000) * (UPDATE_INTERVAL / 1000);
    const headingRad = (obj.heading * Math.PI) / 180;

    obj.lat += Math.cos(headingRad) * speedInDegreesPerSec;
    obj.lon += Math.sin(headingRad) * speedInDegreesPerSec;

    // Keep objects within bounds
    if (obj.lat > CENTER_LAT + SPREAD) obj.lat = CENTER_LAT - SPREAD;
    if (obj.lat < CENTER_LAT - SPREAD) obj.lat = CENTER_LAT + SPREAD;
    if (obj.lon > CENTER_LON + SPREAD) obj.lon = CENTER_LON - SPREAD;
    if (obj.lon < CENTER_LON - SPREAD) obj.lon = CENTER_LON + SPREAD;

    // Slightly vary heading and speed
    obj.heading = (obj.heading + (Math.random() - 0.5) * 10 + 360) % 360;
    obj.speed = Math.max(20, Math.min(100, obj.speed + (Math.random() - 0.5) * 5));

    obj.lastUpdate = Date.now();
  });
}

// Broadcast active objects to all clients
function broadcastObjects() {
  const activeObjects = Array.from(objects.values()).filter((obj) => obj.active);
  const message = JSON.stringify({
    type: 'update',
    timestamp: Date.now(),
    objects: activeObjects.map((obj) => ({
      id: obj.id,
      lat: obj.lat,
      lon: obj.lon,
      heading: obj.heading,
      speed: obj.speed,
    })),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  clients.add(ws);

  // Send initial data
  const activeObjects = Array.from(objects.values()).filter((obj) => obj.active);
  ws.send(
    JSON.stringify({
      type: 'init',
      timestamp: Date.now(),
      objects: activeObjects.map((obj) => ({
        id: obj.id,
        lat: obj.lat,
        lon: obj.lon,
        heading: obj.heading,
        speed: obj.speed,
      })),
    })
  );

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'auth') {
        // Simple auth validation - accept any non-empty key
        if (data.apiKey && data.apiKey.length > 0) {
          ws.send(JSON.stringify({ type: 'auth', success: true }));
        } else {
          ws.send(JSON.stringify({ type: 'auth', success: false, error: 'Invalid API key' }));
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Initialize and start updates
initializeObjects();
console.log(`Mock server started on ws://localhost:${PORT}`);
console.log(`Tracking ${OBJECT_COUNT} objects`);

setInterval(() => {
  updateObjects();
  broadcastObjects();
}, UPDATE_INTERVAL);
