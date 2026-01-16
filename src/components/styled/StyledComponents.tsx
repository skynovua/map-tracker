import { Box, Card, Paper, styled } from '@mui/material';

export const StyledStatCard = styled(Card)(({ theme }) => ({
  '& .MuiCardContent-root': {
    padding: theme.spacing(1.5),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '&:last-child': {
      paddingBottom: theme.spacing(1.5),
    },
  },
}));

export const StyledConnectionCard = styled(Card)<{ connected: boolean }>(
  ({ theme, connected }) => ({
    backgroundColor: connected ? theme.palette.success.light : theme.palette.error.light,
    '& .MuiCardContent-root': {
      padding: theme.spacing(1.5),
      '&:last-child': {
        paddingBottom: theme.spacing(1.5),
      },
    },
  }),
);

export const StyledSidebar = styled(Paper)(({ theme }) => ({
  width: 350,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

export const StyledMapContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[1],
}));

export const StyledFollowingBadge = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderRadius: theme.shape.borderRadius,
}));

export const StyledStatsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));
