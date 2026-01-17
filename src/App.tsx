import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';
import { lazy, Suspense, useEffect } from 'react';

import { useAuthStore, useMapStore } from './hooks/useStores';
import { theme } from './theme/theme';

const MapPage = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));

const App = observer(() => {
  const mapStore = useMapStore();
  const authStore = useAuthStore();

  useEffect(() => {
    if (authStore.isAuthenticated && authStore.apiKey) {
      mapStore.connect(authStore.apiKey);
    }
  }, [authStore.isAuthenticated, authStore.apiKey, mapStore]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense
        fallback={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        {authStore.isAuthenticated ? <MapPage /> : <LoginPage />}
      </Suspense>
    </ThemeProvider>
  );
});

export default App;
