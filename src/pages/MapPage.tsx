import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { MapHeader } from '@/components/MapHeader';
import { useAuthStore, useMapStore } from '@/hooks/useStores';

import { MapViewer } from '../components/MapViewer';
import { StatisticsPanel } from '../components/StatisticsPanel';

export const MapPage = observer(() => {
  const mapStore = useMapStore();
  const authStore = useAuthStore();
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const handleLogout = () => {
    mapStore.disconnect();
    authStore.logout();
  };

  const handleObjectClick = (objectId: string) => {
    if (selectedObjectId === objectId) {
      setSelectedObjectId(null);
      return;
    }

    const obj = mapStore.objects.get(objectId);
    if (obj) {
      setMapCenter([obj.lat, obj.lon]);
      const timeout1 = setTimeout(() => setMapCenter(null), 500);
      timeoutsRef.current.push(timeout1);
    }
    const timeout2 = setTimeout(() => setSelectedObjectId(objectId), 50);
    timeoutsRef.current.push(timeout2);
  };

  const handleStopFollowing = useCallback(() => {
    setSelectedObjectId(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedObjectId) {
        handleStopFollowing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, handleStopFollowing]);

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
