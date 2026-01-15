import 'leaflet/dist/leaflet.css';

import PersonIcon from '@mui/icons-material/Person';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { lazy, Suspense, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

import { useStores } from '@/hooks/useStores';

import { ObjectMarker } from '../components/ObjectMarker';
import { ObjectsList } from '../components/ObjectsList';

const MarkerClusterGroup = lazy(() => import('react-leaflet-cluster'));

const CENTER_LAT = 50.4501;
const CENTER_LON = 30.5234;

interface MapControllerProps {
  center: [number, number] | null;
  followingObject: { lat: number; lon: number } | null;
  isFollowing: boolean;
  onStopFollowing: () => void;
}

const MapController = ({
  center,
  followingObject,
  isFollowing,
  onStopFollowing,
}: MapControllerProps) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 50, { duration: 0.5 });
    }
  }, [center, map]);

  useEffect(() => {
    if (followingObject && isFollowing) {
      map.panTo([followingObject.lat, followingObject.lon], {
        animate: true,
        duration: 0.3,
        easeLinearity: 0.5,
      });
    }
  }, [followingObject, isFollowing, map]);

  // Stop following when user manually drags the map
  useEffect(() => {
    const handleDragStart = () => {
      if (isFollowing) {
        onStopFollowing();
      }
    };

    map.on('dragstart', handleDragStart);
    return () => {
      map.off('dragstart', handleDragStart);
    };
  }, [isFollowing, map, onStopFollowing]);

  return null;
};

export const MapPage = observer(() => {
  const { authStore, mapStore } = useStores();
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  const handleLogout = () => {
    mapStore.disconnect();
    authStore.logout();
  };

  const handleObjectClick = (objectId: string) => {
    // If clicking the same object, toggle off
    if (selectedObjectId === objectId) {
      setSelectedObjectId(null);
      return;
    }

    const obj = mapStore.objects.get(objectId);
    if (obj) {
      setMapCenter([obj.lat, obj.lon]);
      // Clear center after initial fly to avoid double animation
      setTimeout(() => setMapCenter(null), 500);
    }
    // Set selected after a small delay to ensure flyTo happens first
    setTimeout(() => setSelectedObjectId(objectId), 50);
  };

  const handleStopFollowing = () => {
    setSelectedObjectId(null);
  };

  // Get following object position for smooth tracking
  const followingObject = selectedObjectId
    ? (mapStore.objects.get(selectedObjectId) ?? null)
    : null;

  // Handle Escape key to stop following
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedObjectId) {
        handleStopFollowing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Map Tracker
          </Typography>
          {selectedObjectId && (
            <Box sx={{ mr: 2, p: 1, bgcolor: 'rgba(255, 255, 255, 0.15)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                Following: {selectedObjectId}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Press ESC to stop
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography variant="body2">{authStore.apiKey}</Typography>
            </Box>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, gap: 2, p: 2, overflow: 'hidden' }}>
        {/* Map */}
        <Box sx={{ flex: 1, borderRadius: 1, overflow: 'hidden', boxShadow: 1 }}>
          <MapContainer
            center={[CENTER_LAT, CENTER_LON]}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapController
              center={mapCenter}
              followingObject={followingObject}
              isFollowing={!!selectedObjectId}
              onStopFollowing={handleStopFollowing}
            />
            <Suspense fallback={null}>
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={60}
                disableClusteringAtZoom={16}
                spiderfyOnMaxZoom
              >
                {mapStore.getAllObjects().map((obj) => (
                  <ObjectMarker key={obj.id} object={obj} />
                ))}
              </MarkerClusterGroup>
            </Suspense>
          </MapContainer>
        </Box>

        {/* Sidebar with stats and list */}
        <Paper
          sx={{
            width: 350,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Stats */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <Stack spacing={1}>
              <Card variant="outlined">
                <CardContent
                  sx={{
                    p: 1.5,
                    '&:last-child': { pb: 1.5 },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography color="textSecondary" variant="caption">
                    Active
                  </Typography>
                  <Typography variant="h6">{mapStore.stats.active}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent
                  sx={{
                    p: 1.5,
                    '&:last-child': { pb: 1.5 },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography color="textSecondary" variant="caption">
                    Lost
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'warning.main' }}>
                    {mapStore.stats.lost}
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent
                  sx={{
                    p: 1.5,
                    '&:last-child': { pb: 1.5 },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography color="textSecondary" variant="caption">
                    Total
                  </Typography>
                  <Typography variant="h6">{mapStore.stats.total}</Typography>
                </CardContent>
              </Card>
              <Card
                variant="outlined"
                sx={{
                  backgroundColor: mapStore.isConnected ? 'success.light' : 'error.light',
                }}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="caption">
                    {mapStore.isConnected ? 'Connected' : 'Disconnected'}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Box>

          {/* Objects list */}
          <ObjectsList onObjectClick={handleObjectClick} selectedObjectId={selectedObjectId} />
        </Paper>
      </Box>
    </Box>
  );
});
