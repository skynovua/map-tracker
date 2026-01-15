import { Box, Typography } from '@mui/material';
import { divIcon } from 'leaflet';
import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';

import type { TrackedObject } from '../types';

interface ObjectMarkerProps {
  object: TrackedObject & { status: 'active' | 'lost' };
}

export const ObjectMarker = ({ object }: ObjectMarkerProps) => {
  // Memoize icon to prevent recreation on every render
  const markerIcon = useMemo(() => {
    const color = object.status === 'active' ? '#2196F3' : '#FF9800';
    const iconSize = 40;
    const heading = object.heading;

    const svg = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(20, 20) rotate(${heading})">
          <!-- Triangle pointing up -->
          <polygon points="0,-12 -10,10 10,10" fill="${color}" stroke="white" stroke-width="1.5"/>
          <!-- Center dot -->
          <circle cx="0" cy="0" r="3" fill="white"/>
        </g>
        <!-- Border circle -->
        <circle cx="20" cy="20" r="18" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.5"/>
      </svg>
    `;

    return divIcon({
      html: svg,
      iconSize: [iconSize, iconSize],
      className: 'custom-marker',
      iconAnchor: [iconSize / 2, iconSize / 2],
    });
  }, [object.heading, object.status]);

  return (
    <Marker position={[object.lat, object.lon]} icon={markerIcon}>
      <Popup autoPan={false} closeButton={true} autoClose={false} closeOnClick={false}>
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {object.id}
          </Typography>
          <Typography variant="caption">Lat: {object.lat.toFixed(4)}°</Typography>
          <br />
          <Typography variant="caption">Lon: {object.lon.toFixed(4)}°</Typography>
          <br />
          <Typography variant="caption">Heading: {object.heading.toFixed(0)}°</Typography>
          <br />
          <Typography variant="caption">Speed: {object.speed.toFixed(1)} km/h</Typography>
          <br />
          <Typography
            variant="caption"
            sx={{ color: object.status === 'active' ? 'success.main' : 'warning.main' }}
          >
            Status: {object.status.toUpperCase()}
          </Typography>
        </Box>
      </Popup>
    </Marker>
  );
};
