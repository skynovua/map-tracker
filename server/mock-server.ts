import { WebSocket, WebSocketServer } from 'ws';

interface TrackedObject {
  id: string;
  lat: number;
  lon: number;
  heading: number; // 0-360 degrees
  speed: number; // km/h
  lastUpdate: number;
  active: boolean;
  route: RoutePoint[];
  targetIndex: number;
}

interface RoutePoint {
  lat: number;
  lon: number;
}

const PORT = 8080;
const OBJECT_COUNT = 150; // Number of objects to track
const UPDATE_INTERVAL = 1000; // Update every 1 second
const INACTIVE_CHANCE = 0.001; // 0.1% chance per update to become inactive
const REACTIVATE_CHANCE = 0.05; // 5% chance to reactivate

// Kyiv coordinates as center
const CENTER_LAT = 50.4501;
const CENTER_LON = 30.5234;
const MIN_ROUTE_RADIUS = 0.05; // degrees
const MAX_ROUTE_RADIUS = 0.25; // degrees
const MIN_WAYPOINTS = 5;
const MAX_WAYPOINTS = 8;
const TARGET_THRESHOLD = 0.0005; // degrees distance to switch waypoint

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function generateRoute(): RoutePoint[] {
  const count = Math.floor(randBetween(MIN_WAYPOINTS, MAX_WAYPOINTS + 1));
  const baseAngle = randBetween(0, Math.PI * 2);

  const points: RoutePoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle =
      baseAngle + (i * (Math.PI * 2)) / count + randBetween(-(Math.PI / 18), Math.PI / 18); // ±10°
    const radius = randBetween(MIN_ROUTE_RADIUS, MAX_ROUTE_RADIUS);
    points.push({
      lat: CENTER_LAT + Math.cos(angle) * radius,
      lon: CENTER_LON + Math.sin(angle) * radius,
    });
  }

  return points;
}

function bearingDegrees(from: RoutePoint, to: RoutePoint) {
  return ((Math.atan2(to.lon - from.lon, to.lat - from.lat) * 180) / Math.PI + 360) % 360;
}

const objects = new Map<string, TrackedObject>();
const clients = new Set<WebSocket>();

// Initialize objects
function initializeObjects() {
  for (let i = 0; i < OBJECT_COUNT; i++) {
    const id = `OBJ-${String(i + 1).padStart(4, '0')}`;
    const route = generateRoute();
    const initialHeading = bearingDegrees(route[0], route[1 % route.length]);
    objects.set(id, {
      id,
      lat: route[0].lat,
      lon: route[0].lon,
      heading: initialHeading,
      speed: 30 + Math.random() * 70, // 30-100 km/h
      lastUpdate: Date.now(),
      active: true,
      route,
      targetIndex: 1,
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

    // Follow route towards current waypoint
    const target = obj.route[obj.targetIndex];
    const toTargetLat = target.lat - obj.lat;
    const toTargetLon = target.lon - obj.lon;
    const distanceDeg = Math.sqrt(toTargetLat * toTargetLat + toTargetLon * toTargetLon);

    // Compute desired heading
    const desiredHeading = (Math.atan2(toTargetLon, toTargetLat) * 180) / Math.PI;

    // Smooth heading change to avoid jitter
    const headingDelta = ((desiredHeading - obj.heading + 540) % 360) - 180; // shortest path
    obj.heading = (obj.heading + headingDelta * 0.25 + 360) % 360; // ease toward target

    // Convert speed to degrees per interval (approx, using 111km per degree lat)
    const speedInDegreesPerSec = (obj.speed / 111000) * (UPDATE_INTERVAL / 1000);
    const headingRad = (obj.heading * Math.PI) / 180;
    const stepLat = Math.cos(headingRad) * speedInDegreesPerSec;
    const stepLon = Math.sin(headingRad) * speedInDegreesPerSec;

    // Move, but don't overshoot the waypoint
    const nextLat = obj.lat + stepLat;
    const nextLon = obj.lon + stepLon;
    const nextDistanceDeg = Math.sqrt(
      (target.lat - nextLat) * (target.lat - nextLat) +
        (target.lon - nextLon) * (target.lon - nextLon),
    );

    if (nextDistanceDeg < distanceDeg) {
      obj.lat = nextLat;
      obj.lon = nextLon;
    } else {
      // If we would overshoot, snap to target
      obj.lat = target.lat;
      obj.lon = target.lon;
    }

    // Advance to next waypoint when close enough
    if (distanceDeg <= TARGET_THRESHOLD) {
      obj.targetIndex = (obj.targetIndex + 1) % obj.route.length;
    }

    // Slight speed variation to avoid perfect uniformity
    obj.speed = Math.max(30, Math.min(90, obj.speed + (Math.random() - 0.5) * 2));

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
    }),
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
