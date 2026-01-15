import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { authStore, setAuthLoginCallback } from './stores/AuthStore';
import { mapStore } from './stores/MapStore';
import { LoginPage } from './pages/LoginPage';
import { MapPage } from './pages/MapPage';

// Set callback for when user logs in
setAuthLoginCallback((apiKey) => {
  mapStore.connect(apiKey);
});

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
  useEffect(() => {
    // Check if user is already authenticated on mount
    if (authStore.isAuthenticated && authStore.apiKey) {
      mapStore.connect(authStore.apiKey);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {authStore.isAuthenticated ? <MapPage /> : <LoginPage />}
    </ThemeProvider>
  );
});

export default App;
