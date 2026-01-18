const AUTH_TOKEN_KEY = 'map_tracker_token';

export const authService = {
  saveToken: (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },
};
