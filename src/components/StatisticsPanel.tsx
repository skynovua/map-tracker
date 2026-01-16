import { CardContent, Stack, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { useStores } from '@/hooks/useStores';

import { ObjectsList } from './ObjectsList';
import {
  StyledConnectionCard,
  StyledSidebar,
  StyledStatCard,
  StyledStatsContainer,
} from './styled/StyledComponents';

interface StatisticsPanelProps {
  selectedObjectId: string | null;
  onObjectClick: (objectId: string) => void;
}

export const StatisticsPanel = observer(
  ({ selectedObjectId, onObjectClick }: StatisticsPanelProps) => {
    const { mapStore } = useStores();

    return (
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
        <ObjectsList onObjectClick={onObjectClick} selectedObjectId={selectedObjectId} />
      </StyledSidebar>
    );
  },
);

StatisticsPanel.displayName = 'StatisticsPanel';
