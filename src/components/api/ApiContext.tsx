/**
 * API Context and Provider
 *
 * Provides network client, auth token, and API configuration to the app.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { networkClient, getInfoService } from '@sudobility/di';
import { InfoType } from '@sudobility/types';
import type { NetworkClient } from '@sudobility/types';
import { useAuthStatus } from '@sudobility/auth-components';
import { getFirebaseAuth } from '@sudobility/auth_lib';

/**
 * API context value provided to consumers
 */
export interface ApiContextValue {
  /** Network client for making API requests */
  networkClient: NetworkClient;
  /** Base URL for API requests */
  baseUrl: string;
  /** Current user ID (Firebase UID) */
  userId: string | null;
  /** Firebase ID token for authenticated requests */
  token: string | null;
  /** Whether API is ready (user authenticated and token available) */
  isReady: boolean;
  /** Whether auth/token is still loading */
  isLoading: boolean;
  /** Force refresh the ID token */
  refreshToken: () => Promise<string | null>;
}

const ApiContext = createContext<ApiContextValue | null>(null);

/**
 * Hook to access API context
 * @throws Error if used outside of ApiProvider
 */
export function useApi(): ApiContextValue {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}

/**
 * Hook to safely access API context (returns null if not available)
 */
export function useApiSafe(): ApiContextValue | null {
  return useContext(ApiContext);
}

interface ApiProviderProps {
  children: ReactNode;
  /**
   * Base URL for API requests (optional).
   * Defaults to VITE_API_URL env var.
   */
  baseUrl?: string;
}

/**
 * API Provider
 *
 * Manages Firebase ID token and provides API configuration.
 * Uses VITE_API_URL env var for baseUrl by default.
 */
export function ApiProvider({
  children,
  baseUrl: baseUrlProp,
}: ApiProviderProps) {
  const { user, loading: authLoading } = useAuthStatus();
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const auth = getFirebaseAuth();

  const baseUrl = baseUrlProp || import.meta.env.VITE_API_URL || '';
  const userId = user?.uid ?? null;

  // Fetch token when user changes
  useEffect(() => {
    let mounted = true;

    const fetchToken = async () => {
      if (!userId) {
        setToken(null);
        setTokenLoading(false);
        return;
      }

      setTokenLoading(true);
      try {
        const currentUser = auth?.currentUser;
        if (!currentUser) {
          setToken(null);
          return;
        }
        const idToken = await currentUser.getIdToken();
        if (mounted) {
          setToken(idToken);
        }
      } catch {
        try {
          getInfoService().show(
            'Authentication Error',
            'Failed to get ID token',
            InfoType.ERROR,
            5000
          );
        } catch {
          console.error('[ApiProvider] Failed to get ID token');
        }
        if (mounted) {
          setToken(null);
        }
      } finally {
        if (mounted) {
          setTokenLoading(false);
        }
      }
    };

    fetchToken();

    return () => {
      mounted = false;
    };
  }, [userId, auth]);

  // Refresh token function for when token expires
  const refreshToken = useCallback(async (): Promise<string | null> => {
    const currentUser = auth?.currentUser;
    if (!currentUser) return null;
    try {
      const newToken = await currentUser.getIdToken(true); // Force refresh
      setToken(newToken);
      return newToken;
    } catch {
      try {
        getInfoService().show(
          'Authentication Error',
          'Failed to refresh ID token',
          InfoType.ERROR,
          5000
        );
      } catch {
        console.error('[ApiProvider] Failed to refresh ID token');
      }
      setToken(null);
      return null;
    }
  }, [auth]);

  const value = useMemo<ApiContextValue>(
    () => ({
      networkClient,
      baseUrl,
      userId,
      token,
      isReady: !!userId && !!token,
      isLoading: authLoading || tokenLoading,
      refreshToken,
    }),
    [baseUrl, userId, token, authLoading, tokenLoading, refreshToken]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export { ApiContext };
