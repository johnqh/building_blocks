/**
 * AuthQueryCacheReset - drops the query cache when the signed-in user changes.
 */
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getFirebaseAuth } from '@sudobility/auth_lib';

/**
 * Drops every cached query when the signed-in user goes away.
 *
 * Query keys are not scoped by uid, so the cache built up for one user would
 * otherwise be served to the next one that signs in -- with default staleTime
 * the data is still fresh, so nothing refetches and the previous user's
 * workspaces, members and projects stay on screen until a hard reload.
 *
 * Firebase is observed directly rather than through the auth context, because
 * the auth provider is skipped entirely when Firebase is not configured.
 */
export function AuthQueryCacheReset() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    // undefined until the first callback, which reports the session already in
    // place on page load -- that is not a user change and must not clear.
    let previousUid: string | null | undefined;

    return auth.onAuthStateChanged(user => {
      const uid = user?.uid ?? null;
      const priorUid = previousUid;
      previousUid = uid;

      // Sign-out, or a switch straight to another account.
      if (priorUid != null && priorUid !== uid) {
        queryClient.clear();
      }
    });
  }, [queryClient]);

  return null;
}

export default AuthQueryCacheReset;
