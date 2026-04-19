import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { apiClient, setOnUnauthorized } from '../api/client';
import { storage, StorageKeys } from '../utils/storage';
import { ENDPOINTS } from '../api/endpoints';
import { AuthState, LoginCredentials, LoginResponse, User } from '../types/auth.types';

// ─── State & Actions ──────────────────────────────────────────────────────────
type Action =
  | { type: 'RESTORE'; user: User; token: string }
  | { type: 'LOGIN';   user: User; token: string }
  | { type: 'LOGOUT' }
  | { type: 'LOADED' };

const initialState: AuthState = {
  user: null, token: null, isAuthenticated: false, isLoading: true,
};

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'RESTORE':
    case 'LOGIN':
      return { user: action.user, token: action.token, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'LOADED':
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login:  (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    setOnUnauthorized(() => dispatch({ type: 'LOGOUT' }));
    restoreSession();
  }, []);

  const restoreSession = async () => {
    const token = await storage.get<string>(StorageKeys.AUTH_TOKEN);
    const user  = await storage.get<User>(StorageKeys.USER_DATA);
    if (token && user) {
      dispatch({ type: 'RESTORE', token, user });
    } else {
      dispatch({ type: 'LOADED' });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const res = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, credentials);
    await storage.set(StorageKeys.AUTH_TOKEN, res.token);
    await storage.set(StorageKeys.USER_DATA, res.user);
    dispatch({ type: 'LOGIN', token: res.token, user: res.user });
  };

  const logout = async () => {
    try { await apiClient.post(ENDPOINTS.LOGOUT); } catch {}
    await storage.remove(StorageKeys.AUTH_TOKEN);
    await storage.remove(StorageKeys.USER_DATA);
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
