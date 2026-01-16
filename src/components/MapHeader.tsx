import PersonIcon from '@mui/icons-material/Person';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';

import { StyledFollowingBadge } from './styled/StyledComponents';

interface MapHeaderProps {
  selectedObjectId: string | null;
  apiKey: string;
  onLogout: () => void;
}

export const MapHeader = ({ selectedObjectId, apiKey, onLogout }: MapHeaderProps) => {
  return (
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
            <Typography variant="body2">{apiKey}</Typography>
          </Box>
          <Button color="inherit" onClick={onLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
