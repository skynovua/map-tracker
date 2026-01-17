import L from 'leaflet';
import { CircleMarker } from 'react-leaflet';

import { MARKER_COLORS } from '@/constants';

import type { TrackedObject } from '../types';

interface ObjectMarkerProps {
  object: TrackedObject & { status: 'active' | 'lost' };
  onClick: (objectId: string) => void;
  isSelected?: boolean;
}

const canvasRenderer = L.canvas({ padding: 0.5 });

export const ObjectMarker = ({ object, onClick, isSelected = false }: ObjectMarkerProps) => {
  const markerColor =
    object.status === 'active'
      ? isSelected
        ? MARKER_COLORS.selected
        : MARKER_COLORS.active
      : MARKER_COLORS.lost;

  return (
    <CircleMarker
      renderer={canvasRenderer}
      center={[object.lat, object.lon]}
      radius={isSelected ? 20 : 10}
      eventHandlers={{
        click: () => onClick(object.id),
      }}
      pathOptions={{
        fillColor: markerColor,
        fillOpacity: 0.8,
        color: MARKER_COLORS.white,
        weight: 2,
      }}
    />
  );
};
