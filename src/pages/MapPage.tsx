import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import { useStores } from '@/hooks/useStores';

import { MapHeader } from '../components/MapHeader';
import { MapViewer } from '../components/MapViewer';
import { StatisticsPanel } from '../components/StatisticsPanel';

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

  const objects = Array.from(mapStore.objects.values());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <MapHeader
        selectedObjectId={selectedObjectId}
        apiKey={authStore.apiKey}
        onLogout={handleLogout}
      />

      <Box sx={{ display: 'flex', flex: 1, gap: 2, p: 2, overflow: 'hidden' }}>
        <MapViewer
          objects={objects}
          selectedObjectId={selectedObjectId}
          mapCenter={mapCenter}
          onObjectClick={handleObjectClick}
          onStopFollowing={handleStopFollowing}
        />

        <StatisticsPanel selectedObjectId={selectedObjectId} onObjectClick={handleObjectClick} />
      </Box>
    </Box>
  );
});
