import 'leaflet/dist/leaflet.css';

import PersonIcon from '@mui/icons-material/Person';
import { AppBar, Box, Button, CardContent, Stack, Toolbar, Typography } from '@mui/material';
import L from 'leaflet';
import { observer } from 'mobx-react-lite';
import { lazy, Suspense, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

import { useStores } from '@/hooks/useStores';

import { ObjectMarker } from '../components/ObjectMarker';
import { ObjectsList } from '../components/ObjectsList';
import {
  StyledConnectionCard,
  StyledFollowingBadge,
  StyledMapContainer,
  StyledSidebar,
  StyledStatCard,
  StyledStatsContainer,
} from '../components/styled/StyledComponents';
import {
  CLUSTER_DISABLE_AT_ZOOM,
  CLUSTER_MAX_RADIUS,
  MAP_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_FOLLOW_ZOOM,
} from '../constants';

const MarkerClusterGroup = lazy(() => import('react-leaflet-cluster'));

// Custom cluster icon with color gradient based on size
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  let size = 40;
  let colorClass = 'cluster-small';
  let bgColor = '#2196F3';
  const textColor = '#fff';

  if (count >= 100) {
    size = 60;
    colorClass = 'cluster-large';
    bgColor = '#f44336';
  } else if (count >= 50) {
    size = 55;
    colorClass = 'cluster-medium-large';
    bgColor = '#ff5722';
  } else if (count >= 20) {
    size = 50;
    colorClass = 'cluster-medium';
    bgColor = '#ff9800';
  } else if (count >= 10) {
    size = 45;
    colorClass = 'cluster-small-medium';
    bgColor = '#ffc107';
  }

  return L.divIcon({
    html: `
      <div style="
        background: ${bgColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 14px rgba(0,0,0,0.4);
        border: 3px solid #fff;
        font-weight: bold;
        color: ${textColor};
        font-size: ${size > 50 ? '16px' : '14px'};
      ">
        ${count}
      </div>
    `,
    className: `custom-cluster-icon ${colorClass}`,
    iconSize: L.point(size, size, true),
  });
};

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
      map.flyTo(center, MAP_FOLLOW_ZOOM, { duration: 0.5 });
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
            <StyledFollowingBadge>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                Following: {selectedObjectId}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Press ESC to stop
              </Typography>
            </StyledFollowingBadge>
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
        <StyledMapContainer>
          <MapContainer
            center={[MAP_CENTER.LAT, MAP_CENTER.LON]}
            zoom={MAP_DEFAULT_ZOOM}
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
                maxClusterRadius={CLUSTER_MAX_RADIUS}
                disableClusteringAtZoom={CLUSTER_DISABLE_AT_ZOOM}
                spiderfyOnMaxZoom
                iconCreateFunction={createClusterCustomIcon}
                showCoverageOnHover={true}
                spiderLegPolylineOptions={{
                  weight: 2,
                  color: '#2196F3',
                  opacity: 0.6,
                }}
              >
                {mapStore.getAllObjects().map((obj) => (
                  <ObjectMarker key={obj.id} object={obj} />
                ))}
              </MarkerClusterGroup>
            </Suspense>
          </MapContainer>
        </StyledMapContainer>

        {/* Sidebar with stats and list */}
        <StyledSidebar>
          {/* Stats */}
          <StyledStatsContainer>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <Stack spacing={1}>
              <StyledStatCard variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" variant="caption">
                    Active
                  </Typography>
                  <Typography variant="h6">{mapStore.stats.active}</Typography>
                </CardContent>
              </StyledStatCard>
              <StyledStatCard variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" variant="caption">
                    Lost
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'warning.main' }}>
                    {mapStore.stats.lost}
                  </Typography>
                </CardContent>
              </StyledStatCard>
              <StyledStatCard variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" variant="caption">
                    Total
                  </Typography>
                  <Typography variant="h6">{mapStore.stats.total}</Typography>
                </CardContent>
              </StyledStatCard>
              <StyledConnectionCard variant="outlined" connected={mapStore.isConnected}>
                <CardContent>
                  <Typography variant="caption">
                    {mapStore.isConnected ? 'Connected' : 'Disconnected'}
                  </Typography>
                </CardContent>
              </StyledConnectionCard>
            </Stack>
          </StyledStatsContainer>

          {/* Objects list */}
          <ObjectsList onObjectClick={handleObjectClick} selectedObjectId={selectedObjectId} />
        </StyledSidebar>
      </Box>
    </Box>
  );
});
