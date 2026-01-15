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
import { lazy, Suspense } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

import { ObjectMarker } from '../components/ObjectMarker';
import { ObjectsList } from '../components/ObjectsList';
import { authStore } from '../stores/AuthStore';
import { mapStore } from '../stores/MapStore';

const MarkerClusterGroup = lazy(() => import('react-leaflet-cluster'));

const CENTER_LAT = 50.4501;
const CENTER_LON = 30.5234;

export const MapPage = observer(() => {
  const handleLogout = () => {
    mapStore.disconnect();
    authStore.logout();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Map Tracker
          </Typography>
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
            <Suspense fallback={null}>
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={60}
                disableClusteringAtZoom={16}
                spiderfyOnMaxZoom
              >
                {mapStore.getActiveObjects().map((obj) => (
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
          <ObjectsList />
        </Paper>
      </Box>
    </Box>
  );
});
