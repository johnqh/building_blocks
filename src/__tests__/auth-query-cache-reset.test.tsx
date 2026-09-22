/**
 * @fileoverview Tests for AuthQueryCacheReset.
 *
 * Query keys are not scoped by uid, so whatever one user's session cached must
 * be dropped when that session ends -- otherwise the next user to sign in is
 * served the previous user's workspaces, members and projects from a cache that
 * is still within staleTime and therefore never refetches.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type AuthUser = { uid: string } | null;
type Listener = (user: AuthUser) => void;

let listener: Listener | null = null;
const unsubscribe = vi.fn();
let authInstance: { onAuthStateChanged: (l: Listener) => () => void } | null =
  null;

vi.mock('@sudobility/auth_lib', () => ({
  getFirebaseAuth: () => authInstance,
}));

import { AuthQueryCacheReset } from '../components/app/AuthQueryCacheReset';

/** Drive the Firebase auth observer the component subscribed to. */
function emitAuthState(user: AuthUser) {
  listener?.(user);
}

function renderWithCache(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthQueryCacheReset />
    </QueryClientProvider>
  );
}

/** A cache holding one entry, standing in for a signed-in user's data. */
function cacheWithEntry(): QueryClient {
  const queryClient = new QueryClient();
  queryClient.setQueryData(['entities', 'list'], [{ entitySlug: 'user1' }]);
  return queryClient;
}

describe('AuthQueryCacheReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listener = null;
    authInstance = {
      onAuthStateChanged: (l: Listener) => {
        listener = l;
        return unsubscribe;
      },
    };
  });

  it('clears the cache on sign-out', () => {
    const queryClient = cacheWithEntry();
    renderWithCache(queryClient);

    emitAuthState({ uid: 'user1' }); // session already in place on page load
    emitAuthState(null);

    expect(queryClient.getQueryData(['entities', 'list'])).toBeUndefined();
  });

  it('clears the cache when the account switches without signing out', () => {
    const queryClient = cacheWithEntry();
    renderWithCache(queryClient);

    emitAuthState({ uid: 'user1' });
    emitAuthState({ uid: 'user2' });

    expect(queryClient.getQueryData(['entities', 'list'])).toBeUndefined();
  });

  it('keeps the cache for the session already in place on page load', () => {
    const queryClient = cacheWithEntry();
    renderWithCache(queryClient);

    emitAuthState({ uid: 'user1' });

    expect(queryClient.getQueryData(['entities', 'list'])).toEqual([
      { entitySlug: 'user1' },
    ]);
  });

  it('keeps the cache while the same user stays signed in', () => {
    const queryClient = cacheWithEntry();
    renderWithCache(queryClient);

    emitAuthState({ uid: 'user1' });
    emitAuthState({ uid: 'user1' });

    expect(queryClient.getQueryData(['entities', 'list'])).toEqual([
      { entitySlug: 'user1' },
    ]);
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = renderWithCache(new QueryClient());

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('renders without Firebase configured', () => {
    authInstance = null;

    expect(() => renderWithCache(new QueryClient())).not.toThrow();
  });
});
