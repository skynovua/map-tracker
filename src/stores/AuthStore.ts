import { makeAutoObservable } from 'mobx';
import { authService } from '../services/authService';

export class AuthStore {
  isAuthenticated: boolean = false;
  apiKey: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.checkAuth();
  }

  checkAuth = () => {
    const token = authService.getToken();
    this.isAuthenticated = !!token;
    this.apiKey = token || '';
  };

  login = async (apiKey: string): Promise<boolean> => {
    this.isLoading = true;
    this.error = null;

    try {
      // Validate that API key is not empty
      if (!apiKey || apiKey.trim().length === 0) {
        this.error = 'API key cannot be empty';
        this.isLoading = false;
        return false;
      }

      // Store the API key
      authService.saveToken(apiKey);
      this.apiKey = apiKey;
      this.isAuthenticated = true;
      this.isLoading = false;

      return true;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Authentication failed';
      this.isLoading = false;
      return false;
    }
  };

  logout = () => {
    authService.removeToken();
    this.apiKey = '';
    this.isAuthenticated = false;
    this.error = null;
  };
}

export const authStore = new AuthStore();
