import { Box, Typography } from '@mui/material';

import { StyledInfoPanel } from './styled/StyledComponents';

interface MapObject {
  lat: number;
  lon: number;
  heading: number;
  speed: number;
  status: 'active' | 'lost';
}

interface ObjectInfoPanelProps {
  objectId: string;
  object: MapObject | null;
}

export const ObjectInfoPanel = ({ objectId, object }: ObjectInfoPanelProps) => {
  if (!object) return null;

  return (
    <StyledInfoPanel elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        {objectId}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="body2">
          <strong>Lat:</strong> {object.lat.toFixed(6)}°
        </Typography>
        <Typography variant="body2">
          <strong>Lon:</strong> {object.lon.toFixed(6)}°
        </Typography>
        <Typography variant="body2">
          <strong>Heading:</strong> {object.heading.toFixed(0)}°
        </Typography>
        <Typography variant="body2">
          <strong>Speed:</strong> {object.speed.toFixed(1)} km/h
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: object.status === 'active' ? 'success.main' : 'warning.main',
            fontWeight: 'bold',
          }}
        >
          <strong>Status:</strong> {object.status.toUpperCase()}
        </Typography>
      </Box>
    </StyledInfoPanel>
  );
};
