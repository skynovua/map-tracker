import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { mapStore } from '../stores/MapStore';

type FilterType = 'all' | 'active' | 'lost';
type MapObject = ReturnType<typeof mapStore.getAllObjects>[number];

export const ObjectsList = observer(() => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const getObjects = (): MapObject[] => {
    let objects: MapObject[] = [];

    if (filter === 'active') {
      objects = mapStore.getActiveObjects();
    } else if (filter === 'lost') {
      objects = mapStore.getLostObjects();
    } else {
      objects = mapStore.getAllObjects();
    }

    // Filter by search
    if (search.trim()) {
      objects = objects.filter((obj) => obj.id.toLowerCase().includes(search.toLowerCase()));
    }

    // Sort by ID
    return objects.sort((a, b) => a.id.localeCompare(b.id));
  };

  const objects = getObjects();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Search */}
      <Box sx={{ p: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={filter} onChange={(_, newValue) => setFilter(newValue as FilterType)}>
          <Tab label={`All (${mapStore.stats.total})`} value="all" />
          <Tab label={`Active (${mapStore.stats.active})`} value="active" />
          <Tab label={`Lost (${mapStore.stats.lost})`} value="lost" />
        </Tabs>
      </Box>

      {/* List */}
      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
        }}
      >
        {objects.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary" variant="body2">
              No objects found
            </Typography>
          </Box>
        ) : (
          objects.map((obj) => (
            <ListItem key={obj.id} disablePadding>
              <ListItemButton
                sx={{
                  py: 1,
                  borderLeft: 4,
                  borderColor:
                    obj.status === 'active'
                      ? 'success.main'
                      : obj.status === 'lost'
                        ? 'warning.main'
                        : 'grey.300',
                }}
              >
                <ListItemText
                  primary={obj.id}
                  secondary={
                    <>
                      <Typography component="span" variant="caption" color="textSecondary">
                        {obj.status.toUpperCase()}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="textSecondary"
                        sx={{ ml: 1 }}
                      >
                        {obj.heading.toFixed(0)}° {obj.speed.toFixed(0)} km/h
                      </Typography>
                    </>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
});
