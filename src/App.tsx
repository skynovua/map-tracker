import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';
import { lazy, Suspense, useEffect } from 'react';

import { useStores } from './hooks/useStores';

const MapPage = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#1976D2',
    },
  },
});

const App = observer(() => {
  const { authStore, mapStore } = useStores();

  useEffect(() => {
    // Check if user is already authenticated on mount
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
