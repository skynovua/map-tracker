import { Marker } from 'react-leaflet';

import type { TrackedObject } from '../types';
import { useMarkerIcon } from './hooks/useMarkerIcon';

interface ObjectMarkerProps {
  object: TrackedObject & { status: 'active' | 'lost' };
  onClick: (objectId: string) => void;
  isSelected?: boolean;
}

export const ObjectMarker = ({ object, onClick, isSelected = false }: ObjectMarkerProps) => {
  const markerIcon = useMarkerIcon({
    heading: object.heading,
    status: object.status,
    isSelected,
  });

  return (
    <Marker
      position={[object.lat, object.lon]}
      icon={markerIcon}
      eventHandlers={{
        click: () => onClick(object.id),
      }}
    />
  );
};
