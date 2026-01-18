import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { useAuthStore } from '@/hooks/useStores';

export const LoginPage = observer(() => {
  const authStore = useAuthStore();
  const [apiKey, setApiKey] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await authStore.login(apiKey);
    if (success) {
      setApiKey('');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Map Tracker
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
              Enter your API key to access the tracking system
            </Typography>

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="API Key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                margin="normal"
                disabled={authStore.isLoading}
                placeholder="Enter your unique API key"
              />

              {authStore.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {authStore.error}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                sx={{ mt: 3 }}
                disabled={authStore.isLoading || !apiKey.trim()}
              >
                {authStore.isLoading ? <CircularProgress size={24} /> : 'Login'}
              </Button>

              <Typography variant="caption" display="block" align="center" sx={{ mt: 2 }}>
                Use any non-empty API key for this demo.
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
});
