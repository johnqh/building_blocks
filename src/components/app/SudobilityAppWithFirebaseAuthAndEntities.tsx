/**
 * SudobilityAppWithFirebaseAuthAndEntities - App wrapper with Firebase auth and entity support
 *
 * Extends SudobilityAppWithFirebaseAuth with:
 * - AuthAwareEntityProvider that connects entity context to auth state (built-in default)
 * - EntityAwareSubscriptionProvider that connects subscription to entity (built-in default)
 */
import { ComponentType, ReactNode, useMemo } from 'react';
import {
  SudobilityAppWithFirebaseAuth,
  SudobilityAppWithFirebaseAuthProps,
} from './SudobilityAppWithFirebaseAuth';
import { useAuthStatus } from '@sudobility/auth-components';
import {
  CurrentEntityProvider,
  EntityClient,
  useCurrentEntity,
} from '@sudobility/entity_client';
import { getFirebaseAuth } from '@sudobility/auth_lib';
import { LazySubscriptionProvider } from '../subscription';

export interface SudobilityAppWithFirebaseAuthAndEntitiesProps extends Omit<
  SudobilityAppWithFirebaseAuthProps,
  'AppProviders'
> {
  /**
   * Base URL for the API (optional).
   * Defaults to VITE_API_URL env var.
   * Used for both ApiProvider and EntityClient.
   *
   * @example "https://api.myapp.com"
   */
  apiUrl?: string;

  /**
   * @deprecated Use apiUrl instead. Will be removed in future version.
   */
  entityApiUrl?: string;

  /**
   * RevenueCat API key for subscriptions (optional).
   * If not provided, reads from VITE_REVENUECAT_API_KEY env var.
   * If neither is available, subscription features are disabled.
   */
  revenueCatApiKey?: string;

  /**
   * Custom AuthAwareEntityProvider component (optional).
   * Defaults to built-in provider if entityApiUrl is provided.
   */
  AuthAwareEntityProvider?: ComponentType<{ children: ReactNode }>;

  /**
   * Custom EntityAwareSubscriptionProvider component (optional).
   * Defaults to built-in provider that uses LazySubscriptionProvider.
   * Set to false to disable subscription features entirely.
   */
  EntityAwareSubscriptionProvider?:
    | ComponentType<{ children: ReactNode }>
    | false;

  /**
   * Additional providers to wrap around the router content.
   * These are rendered inside EntityAwareSubscriptionProvider but outside BrowserRouter.
   * Use this for app-specific providers like ApiProvider.
   */
  AppProviders?: ComponentType<{ children: ReactNode }>;
}

/**
 * Get Firebase auth token for API requests
 */
async function getAuthToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  const currentUser = auth?.currentUser;
  if (!currentUser) {
    return null;
  }
  try {
    return await currentUser.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Create a default entity client for the given API URL
 */
function createEntityClient(baseUrl: string): EntityClient {
  return new EntityClient({
    baseUrl,
    getAuthToken,
  });
}

// Cache for entity clients by URL
const entityClientCache = new Map<string, EntityClient>();

function getOrCreateEntityClient(baseUrl: string): EntityClient {
  let client = entityClientCache.get(baseUrl);
  if (!client) {
    client = createEntityClient(baseUrl);
    entityClientCache.set(baseUrl, client);
  }
  return client;
}

/**
 * Default AuthAwareEntityProvider using CurrentEntityProvider
 */
function DefaultAuthAwareEntityProvider({
  children,
  entityClient,
}: {
  children: ReactNode;
  entityClient: EntityClient;
}) {
  const { user } = useAuthStatus();
  const authUser = useMemo(
    () => (user ? { uid: user.uid, email: user.email } : null),
    [user]
  );

  return (
    <CurrentEntityProvider client={entityClient} user={authUser}>
      {children}
    </CurrentEntityProvider>
  );
}

/**
 * Default EntityAwareSubscriptionProvider using LazySubscriptionProvider
 */
function DefaultEntityAwareSubscriptionProvider({
  children,
  apiKey,
}: {
  children: ReactNode;
  apiKey: string;
}) {
  const { currentEntityId } = useCurrentEntity();
  return (
    <LazySubscriptionProvider
      entityId={currentEntityId ?? undefined}
      apiKey={apiKey}
    >
      {children}
    </LazySubscriptionProvider>
  );
}

/**
 * SudobilityAppWithFirebaseAuthAndEntities - Full-featured app wrapper
 *
 * @example
 * ```tsx
 * // Minimal usage with entityApiUrl - uses all defaults
 * import { SudobilityAppWithFirebaseAuthAndEntities } from '@sudobility/building_blocks';
 * import i18n from './i18n';
 *
 * function App() {
 *   return (
 *     <SudobilityAppWithFirebaseAuthAndEntities
 *       i18n={i18n}
 *       entityApiUrl="https://api.myapp.com/api/v1"
 *     >
 *       <Routes>
 *         <Route path="/" element={<HomePage />} />
 *       </Routes>
 *     </SudobilityAppWithFirebaseAuthAndEntities>
 *   );
 * }
 *
 * // With custom providers
 * function App() {
 *   return (
 *     <SudobilityAppWithFirebaseAuthAndEntities
 *       i18n={i18n}
 *       AuthAwareEntityProvider={MyEntityProvider}
 *       EntityAwareSubscriptionProvider={MySubscriptionProvider}
 *       AppProviders={ApiProvider}
 *     >
 *       <Routes>
 *         <Route path="/" element={<HomePage />} />
 *       </Routes>
 *     </SudobilityAppWithFirebaseAuthAndEntities>
 *   );
 * }
 * ```
 */
export function SudobilityAppWithFirebaseAuthAndEntities({
  apiUrl,
  entityApiUrl, // deprecated, use apiUrl
  revenueCatApiKey,
  AuthAwareEntityProvider: AuthAwareEntityProviderProp,
  EntityAwareSubscriptionProvider: EntityAwareSubscriptionProviderProp,
  AppProviders,
  ...baseProps
}: SudobilityAppWithFirebaseAuthAndEntitiesProps) {
  // Get API URL from prop or env var
  // Support deprecated entityApiUrl for backwards compatibility
  const baseApiUrl = apiUrl || import.meta.env.VITE_API_URL || '';
  const entityUrl = entityApiUrl || (baseApiUrl ? `${baseApiUrl}/api/v1` : '');

  // Get or create entity client if URL is provided
  const entityClient = useMemo(
    () => (entityUrl ? getOrCreateEntityClient(entityUrl) : null),
    [entityUrl]
  );

  // Get RevenueCat API key from prop or env var
  const rcApiKey = revenueCatApiKey || import.meta.env.VITE_REVENUECAT_API_KEY;

  // Create a combined providers component that includes entity support
  const EntityProviders: ComponentType<{ children: ReactNode }> = ({
    children,
  }) => {
    let content = children;

    // Wrap with AppProviders if provided
    if (AppProviders) {
      content = <AppProviders>{content}</AppProviders>;
    }

    // Wrap with EntityAwareSubscriptionProvider (custom, default, or disabled)
    if (EntityAwareSubscriptionProviderProp === false) {
      // Explicitly disabled - skip subscription provider
    } else if (EntityAwareSubscriptionProviderProp) {
      // Custom provider
      content = (
        <EntityAwareSubscriptionProviderProp>
          {content}
        </EntityAwareSubscriptionProviderProp>
      );
    } else if (rcApiKey) {
      // Default provider with API key
      content = (
        <DefaultEntityAwareSubscriptionProvider apiKey={rcApiKey}>
          {content}
        </DefaultEntityAwareSubscriptionProvider>
      );
    }
    // If no API key and no custom provider, subscription features are silently disabled

    // Wrap with AuthAwareEntityProvider (custom or default)
    if (AuthAwareEntityProviderProp) {
      return (
        <AuthAwareEntityProviderProp>{content}</AuthAwareEntityProviderProp>
      );
    }

    // Use default if entityClient is available
    if (entityClient) {
      return (
        <DefaultAuthAwareEntityProvider entityClient={entityClient}>
          {content}
        </DefaultAuthAwareEntityProvider>
      );
    }

    // No entity support if no entityApiUrl or custom provider
    console.warn(
      '[SudobilityAppWithFirebaseAuthAndEntities] No entityApiUrl or AuthAwareEntityProvider provided - entity features disabled'
    );
    return <>{content}</>;
  };

  return (
    <SudobilityAppWithFirebaseAuth
      {...baseProps}
      AppProviders={EntityProviders}
    />
  );
}

export default SudobilityAppWithFirebaseAuthAndEntities;
